/*
 * Isolated SQL execution for the static learning lab.
 * Keep versions pinned here; this file is served as a classic Worker.
 */
const SQL_JS_CDN_BASE = 'https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/'
const SQL_JS_CDN_SCRIPT = `${SQL_JS_CDN_BASE}sql-wasm.js`
const PARSER_CDN_SCRIPT = 'https://cdn.jsdelivr.net/npm/node-sql-parser@5.4.0/umd/mysql.umd.js'
const VENDOR_BASE = new URL('./vendor/', self.location.href).toString()
const MAX_RESULT_ROWS = 5000
const MAX_SCANNED_ROWS = 100000
const MYSQL_OPTIONS = { database: 'MySQL' }

let SQL = null
let parser = null
let database = null
let schemaSql = ''

self.addEventListener('message', async (event) => {
  const { requestId, type, payload = {} } = event.data || {}
  try {
    let result
    if (type === 'init') {
      schemaSql = String(payload.schemaSql || '')
      await loadDependencies()
      await createReadOnlyDatabase()
      result = { ready: true }
    } else if (type === 'run') {
      if (!database || !parser) throw new Error('The SQL engine is not ready. Retry the engine and try again.')
      assertReadOnlySelect(payload.sql)
      result = executeSelect(payload.sql)
    } else if (type === 'reset') {
      await createReadOnlyDatabase()
      result = { reset: true }
    } else {
      throw new Error('Unknown SQL engine request.')
    }
    self.postMessage({ requestId, ok: true, result })
  } catch (error) {
    self.postMessage({
      requestId,
      ok: false,
      error: { message: String(error?.message || error), code: error?.code || 'QUERY_FAILED' },
    })
  }
})

async function loadDependencies() {
  if (!SQL) {
    let localSqlLoaded = false
    if (!self.initSqlJs) {
      try {
        importScripts(`${VENDOR_BASE}sql-wasm.js`)
        localSqlLoaded = Boolean(self.initSqlJs)
      } catch {
        importScripts(SQL_JS_CDN_SCRIPT)
      }
    }
    if (!self.NodeSQLParser?.Parser) {
      try {
        importScripts(`${VENDOR_BASE}mysql.umd.js`)
      } catch {
        importScripts(PARSER_CDN_SCRIPT)
      }
    }
    if (!self.initSqlJs || !self.NodeSQLParser?.Parser) {
      throw new Error('A required SQL engine dependency did not load. Check your connection and retry.')
    }
    try {
      SQL = await self.initSqlJs({ locateFile: (file) => `${localSqlLoaded ? VENDOR_BASE : SQL_JS_CDN_BASE}${file}` })
    } catch (localError) {
      if (!localSqlLoaded) throw localError
      SQL = await self.initSqlJs({ locateFile: (file) => `${SQL_JS_CDN_BASE}${file}` })
    }
    parser = new self.NodeSQLParser.Parser()
  }
}

async function createReadOnlyDatabase() {
  if (!SQL || !schemaSql) throw new Error('The sample database could not be loaded.')
  database?.close()
  database = new SQL.Database()
  database.run(schemaSql)
  // Schema setup runs before this switch. User SQL is prepared only afterward.
  database.run('PRAGMA query_only = ON;')
  database.run('PRAGMA trusted_schema = OFF;')
}

function assertReadOnlySelect(sql) {
  const source = String(sql || '')
  const statementCount = countStatements(source)
  if (statementCount === 0) throw new Error('Write a SELECT query before running it.')
  if (statementCount > 1) {
    const error = new Error('Run one SELECT statement at a time. Multiple statements are not allowed.')
    error.code = 'MULTIPLE_STATEMENTS'
    throw error
  }

  let parsed
  try {
    parsed = parser.astify(source, MYSQL_OPTIONS)
  } catch (error) {
    const wrapped = new Error(`This SQL could not be verified as a read-only SELECT. ${error?.message || ''}`.trim())
    wrapped.code = 'UNVERIFIED_SQL'
    throw wrapped
  }
  const statements = Array.isArray(parsed) ? parsed : [parsed]
  if (statements.length !== 1 || statements[0]?.type !== 'select') {
    const error = new Error('Only read-only SELECT queries are allowed in this lab.')
    error.code = 'READ_ONLY'
    throw error
  }

  // SQL.js ships a fixed SQLite build. These dangerous extension functions are
  // denied explicitly even if a future build registers them by default.
  if (containsBlockedFunction(statements[0])) {
    const error = new Error('This query calls a file or extension function that is disabled in the learning lab.')
    error.code = 'READ_ONLY_FUNCTION'
    throw error
  }
}

function containsBlockedFunction(node) {
  if (!node || typeof node !== 'object') return false
  if (Array.isArray(node)) return node.some(containsBlockedFunction)
  const name = String(node.name?.name || node.name || '').replace(/[`"']/g, '').toLowerCase()
  if (node.type === 'function' && ['load_extension', 'readfile', 'writefile', 'fts3_tokenizer'].includes(name)) return true
  return Object.values(node).some(containsBlockedFunction)
}

function executeSelect(sql) {
  let statement
  try {
    statement = database.prepare(String(sql))
    const columns = statement.getColumnNames()
    const rows = []
    let totalRows = 0
    while (statement.step()) {
      totalRows += 1
      if (totalRows > MAX_SCANNED_ROWS) {
        const error = new Error(`This query produces more than ${MAX_SCANNED_ROWS.toLocaleString()} rows. Add a LIMIT to keep the result manageable.`)
        error.code = 'RESULT_TOO_LARGE'
        throw error
      }
      if (rows.length < MAX_RESULT_ROWS) rows.push(statement.get())
    }
    return {
      columns,
      rows,
      totalRows,
      truncated: totalRows > MAX_RESULT_ROWS,
    }
  } finally {
    statement?.free()
  }
}

// Count non-empty statements while respecting SQL strings and comments. The
// parser remains the authoritative statement-type check; this catches stacked
// statements even if a parser version happens to return only its first AST.
function countStatements(sql) {
  let count = 0
  let hasContent = false
  let quote = ''
  let lineComment = false
  let blockComment = false

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index]
    const next = sql[index + 1]

    if (lineComment) {
      if (char === '\n' || char === '\r') lineComment = false
      continue
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false
        index += 1
      }
      continue
    }
    if (quote) {
      if (char === quote) {
        if (next === quote && quote !== ']') index += 1
        else quote = ''
      } else if (char === '\\' && quote !== ']') {
        index += 1
      }
      continue
    }

    if (char === '-' && next === '-') {
      lineComment = true
      index += 1
    } else if (char === '#') {
      lineComment = true
    } else if (char === '/' && next === '*') {
      blockComment = true
      index += 1
    } else if (char === "'" || char === '"' || char === '`') {
      quote = char
      hasContent = true
    } else if (char === '[') {
      quote = ']'
      hasContent = true
    } else if (char === ';') {
      if (hasContent) count += 1
      hasContent = false
    } else if (!/\s/.test(char)) {
      hasContent = true
    }
  }
  if (hasContent) count += 1
  return count
}
