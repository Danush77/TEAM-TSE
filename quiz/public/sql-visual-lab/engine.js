const MYSQL_OPTIONS = { database: 'MySQL' }

export const SCHEMA_TABLES = Object.freeze({
  departments: [
    ['id', 'INTEGER'], ['name', 'TEXT'], ['location', 'TEXT'],
  ],
  employees: [
    ['id', 'INTEGER'], ['name', 'TEXT'], ['department_id', 'INTEGER'],
    ['salary', 'INTEGER'], ['hire_date', 'TEXT'], ['manager_id', 'INTEGER'],
  ],
  orders: [
    ['id', 'INTEGER'], ['employee_id', 'INTEGER'], ['amount', 'REAL'],
    ['order_date', 'TEXT'], ['status', 'TEXT'],
  ],
})

export function inspectQuery(sql, parser) {
  const normalized = String(sql || '').trim()
  if (!normalized) throw new Error('Write a SELECT query before running it.')

  const statements = splitStatements(normalized)
  if (statements.length > 1) {
    throw new Error('Run one SELECT statement at a time. Multiple statements are not allowed.')
  }

  const firstKeyword = normalized.replace(/^(?:\s|--[^\n]*(?:\n|$)|#[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)+/g, '').match(/^([a-z]+)/i)?.[1]?.toUpperCase()
  if (firstKeyword !== 'SELECT' && firstKeyword !== 'WITH') {
    throw new Error('Only read-only SELECT queries are allowed in this lab.')
  }

  if (!parser) {
    if (firstKeyword !== 'SELECT') {
      throw new Error('The SQL parser did not load, so this query could not be safely checked. Try a SELECT query.')
    }
    return { ast: null, visualizationAvailable: false, reason: 'The SQL parser is unavailable. Your SELECT result can still be shown.' }
  }

  let parsed
  try {
    parsed = parser.astify(normalized, MYSQL_OPTIONS)
  } catch (error) {
    if (firstKeyword !== 'SELECT') {
      throw new Error('This query could not be safely verified as read-only. Try a SELECT query without a CTE.')
    }
    return {
      ast: null,
      visualizationAvailable: false,
      reason: 'This query could not be broken into visual steps. The final result is still available.',
      parseError: error,
    }
  }

  const statementsFromParser = Array.isArray(parsed) ? parsed : [parsed]
  if (statementsFromParser.length !== 1) {
    throw new Error('Run one SELECT statement at a time. Multiple statements are not allowed.')
  }

  const ast = statementsFromParser[0]
  if (!ast || ast.type !== 'select') {
    throw new Error('Only read-only SELECT queries are allowed in this lab.')
  }

  const unsupported = explainUnsupportedQuery(ast)
  return { ast, visualizationAvailable: !unsupported, reason: unsupported || '' }
}

export async function buildExecutionSteps(parser, ast, queryRunner) {
  const supportMessage = explainUnsupportedQuery(ast)
  if (supportMessage) return { available: false, reason: supportMessage, steps: [] }

  const steps = []
  let previousResult = null
  const sourceEntries = Array.isArray(ast.from) ? ast.from : []
  const hasFrom = sourceEntries.length > 0

  const runStep = async (definition, options) => {
    const statement = makePartialQuery(parser, ast, options)
    const result = await queryRunner(statement)
    const step = {
      ...definition,
      sql: statement,
      input: previousResult,
      result,
    }
    steps.push(step)
    previousResult = result
    return step
  }

  try {
    if (hasFrom) {
      const first = sourceEntries[0]
      const fromName = getTableName(first)
      await runStep({
        id: 'from',
        label: 'FROM',
        title: `Start with ${fromName}`,
        description: `FROM reads the starting rows from ${fromName}. No filtering or column selection has happened yet.`,
      }, { fromCount: 1 })

      for (let index = 1; index < sourceEntries.length; index += 1) {
        const entry = sourceEntries[index]
        const joinType = String(entry.join || 'JOIN').replace(/\s+JOIN$/i, '').trim() || 'INNER'
        const tableName = getTableName(entry)
      await runStep({
        id: `join-${index}`,
        kind: 'join',
        joinType,
        title: `${joinType} JOIN ${tableName}`,
        description: describeJoin(entry, tableName, joinType, parser),
        joinTable: tableName,
        joinRight: await queryRunner(`SELECT * FROM \`${String(tableName).replace(/`/g, '``')}\` LIMIT 8`),
      }, { fromCount: index + 1 })
      }
    }

    if (ast.where) {
      const filterRows = makePartialQuery(parser, ast, {
        fromCount: sourceEntries.length,
        includeWhere: false,
      })
      const markedRows = makePartialQuery(parser, ast, {
        fromCount: sourceEntries.length,
        includeWhere: false,
        columns: [
          { expr: ast.where, as: '__visual_where_passes' },
          { expr: { type: 'column_ref', table: null, column: '*' }, as: null },
        ],
      })
      const markerResult = await queryRunner(markedRows)
      await runStep({
        id: 'where',
        title: 'WHERE',
        description: `WHERE checks each incoming row against ${expressionText(ast.where, parser)}. Rows that do not match are removed before groups are formed.`,
        filterFlags: markerResult.rows.map((row) => Boolean(row[0])),
        filterReason: expressionText(ast.where, parser),
        filterInput: await queryRunner(filterRows),
      }, { fromCount: sourceEntries.length, includeWhere: true })
    }

    const groupExpressions = getGroupExpressions(ast)
    if (groupExpressions.length) {
      const inputRows = makePartialQuery(parser, ast, {
        fromCount: sourceEntries.length,
        includeWhere: Boolean(ast.where),
      })
      const groupKeyColumns = groupExpressions.map((expr, index) => ({
        expr,
        as: `__visual_group_${index + 1}`,
      }))
      const groupRowsSql = makePartialQuery(parser, ast, {
        fromCount: sourceEntries.length,
        includeWhere: Boolean(ast.where),
        columns: [
          ...groupKeyColumns,
          { expr: { type: 'column_ref', table: null, column: '*' }, as: null },
        ],
      })
      const grouped = buildGroupBuckets(await queryRunner(groupRowsSql), groupExpressions, parser)
      await runStep({
        id: 'group',
        title: 'GROUP BY',
        description: `GROUP BY collects the ${(await queryRunner(inputRows)).totalRows} incoming rows into groups using ${groupExpressions.map((expr) => expressionText(expr, parser)).join(', ')}.`,
        kind: 'groups',
        buckets: grouped.buckets,
        bucketResult: grouped.result,
      }, {
        fromCount: sourceEntries.length,
        includeWhere: Boolean(ast.where),
        columns: groupKeyColumns,
        includeGroupBy: true,
      })
    }

    if (hasAggregate(ast.columns) && groupExpressions.length) {
      await runStep({
        id: 'aggregate',
        title: 'AGGREGATE',
        description: 'Aggregate functions calculate a value for each group. COUNT, SUM, AVG, MIN, and MAX ignore NULL values where SQL defines them to.',
      }, {
        fromCount: sourceEntries.length,
        includeWhere: Boolean(ast.where),
        includeGroupBy: true,
        columns: ast.columns,
      })
    } else if (hasAggregate(ast.columns) && !groupExpressions.length) {
      await runStep({
        id: 'aggregate',
        title: 'AGGREGATE',
        description: 'Without GROUP BY, aggregate functions calculate one result for the entire set of rows.',
      }, {
        fromCount: sourceEntries.length,
        includeWhere: Boolean(ast.where),
        columns: ast.columns,
      })
    }

    if (ast.having) {
      const beforeHaving = makePartialQuery(parser, ast, {
        fromCount: sourceEntries.length,
        includeWhere: Boolean(ast.where),
        includeGroupBy: true,
        includeHaving: false,
        columns: ast.columns,
      })
      const beforeResult = await queryRunner(beforeHaving)
      const havingStep = await runStep({
        id: 'having',
        title: 'HAVING',
        description: `HAVING filters completed groups using ${expressionText(ast.having, parser)}. Aggregates are calculated before this filter is applied.`,
        kind: 'having',
        filterReason: expressionText(ast.having, parser),
        filterInput: beforeResult,
      }, {
        fromCount: sourceEntries.length,
        includeWhere: Boolean(ast.where),
        includeGroupBy: true,
        includeHaving: true,
        columns: ast.columns,
      })

      if (groupExpressions.length) {
        const groupKeysBefore = await queryRunner(makeGroupKeyQuery(parser, ast, false))
        const groupKeysAfter = await queryRunner(makeGroupKeyQuery(parser, ast, true))
        havingStep.groupFlags = buildGroupFlags(groupKeysBefore, groupKeysAfter, groupExpressions.length)
        havingStep.groupBuckets = groupKeysBefore.rows.map((row) => ({
          keys: row.slice(0, groupExpressions.length),
          kept: hasMatchingGroup(row.slice(0, groupExpressions.length), groupKeysAfter.rows, groupExpressions.length),
        }))
      }
    }

    if (!ast.columns || ast.columns === '*') {
      // A plain SELECT * still has a projection step; the result is the source rows.
    }
    await runStep({
      id: 'select',
      title: 'SELECT',
      description: describeSelect(ast.columns, parser),
      selectedColumns: getReferencedColumns(ast.columns),
    }, {
      fromCount: sourceEntries.length,
      includeWhere: Boolean(ast.where),
      includeGroupBy: Boolean(ast.groupby),
      includeHaving: Boolean(ast.having),
      columns: ast.columns,
    })

    if (ast.distinct) {
      await runStep({
        id: 'distinct',
        title: 'DISTINCT',
        description: 'DISTINCT compares the selected column values and removes duplicate result rows.',
      }, {
        fromCount: sourceEntries.length,
        includeWhere: Boolean(ast.where),
        includeGroupBy: Boolean(ast.groupby),
        includeHaving: Boolean(ast.having),
        columns: ast.columns,
        includeDistinct: true,
      })
    }

    if (ast.orderby?.length) {
      await runStep({
        id: 'order',
        kind: 'order',
        title: 'ORDER BY',
        description: `ORDER BY sorts the selected rows by ${ast.orderby.map((order) => `${expressionText(order.expr, parser)} ${order.type || 'ASC'}`).join(', ')}.`,
      }, {
        fromCount: sourceEntries.length,
        includeWhere: Boolean(ast.where),
        includeGroupBy: Boolean(ast.groupby),
        includeHaving: Boolean(ast.having),
        columns: ast.columns,
        includeDistinct: Boolean(ast.distinct),
        includeOrderBy: true,
      })
    }

    if (ast.limit) {
      const inputBeforeLimit = makePartialQuery(parser, ast, {
        fromCount: sourceEntries.length,
        includeWhere: Boolean(ast.where),
        includeGroupBy: Boolean(ast.groupby),
        includeHaving: Boolean(ast.having),
        columns: ast.columns,
        includeDistinct: Boolean(ast.distinct),
        includeOrderBy: Boolean(ast.orderby?.length),
      })
      const limitStep = await runStep({
        id: 'limit',
        kind: 'limit',
        title: 'LIMIT',
        description: 'LIMIT keeps only the first requested rows after sorting. Later rows are outside the final result.',
        filterInput: await queryRunner(inputBeforeLimit),
      }, {
        fromCount: sourceEntries.length,
        includeWhere: Boolean(ast.where),
        includeGroupBy: Boolean(ast.groupby),
        includeHaving: Boolean(ast.having),
        columns: ast.columns,
        includeDistinct: Boolean(ast.distinct),
        includeOrderBy: Boolean(ast.orderby?.length),
        includeLimit: true,
      })
      limitStep.limitCount = limitStep.result.totalRows
    }

    return { available: steps.length > 0, reason: '', steps }
  } catch (error) {
    if (error?.name === 'AbortError' || error?.code === 'TIMEOUT') throw error
    return {
      available: false,
      reason: `Step view not available for this query yet. The final result is still shown. (${friendlyEngineError(error)})`,
      steps: [],
    }
  }
}

export function friendlyEngineError(error, knownColumns = []) {
  const message = String(error?.message || error || 'The query could not be run.')
  const missingColumn = message.match(/no such column:\s*["'`]?([\w.]+)["'`]?/i)
  if (missingColumn) {
    const requested = missingColumn[1].split('.').at(-1).toLowerCase()
    const suggestion = closestName(requested, knownColumns)
    return suggestion
      ? `Column “${requested}” was not found. Did you mean “${suggestion}”?`
      : `Column “${requested}” was not found. Check the column names in the schema.`
  }

  const missingTable = message.match(/no such table:\s*["'`]?([\w.]+)["'`]?/i)
  if (missingTable) {
    const tableName = missingTable[1].split('.').at(-1)
    return `Table “${tableName}” was not found. Choose one of the tables in the schema panel.`
  }

  if (/syntax error|incomplete input|unrecognized token/i.test(message)) {
    return 'There is a SQL syntax issue. Check the highlighted line and make sure each clause is complete.'
  }

  return message.replace(/^SQLite error:\s*/i, '')
}

export function findErrorLine(sql, error) {
  const explicitLine = Number(error?.location?.start?.line || error?.lineNumber || error?.line)
  if (Number.isInteger(explicitLine) && explicitLine > 0) return explicitLine - 1

  const missingName = String(error?.message || error || '').match(/no such column:\s*["'`]?([\w.]+)["'`]?/i)?.[1]?.split('.').at(-1)
  if (missingName) {
    const pattern = new RegExp(`\\b${escapeRegExp(missingName)}\\b`, 'i')
    const match = pattern.exec(sql)
    if (match) return sql.slice(0, match.index).split('\n').length - 1
  }

  return 0
}

function makePartialQuery(parser, ast, options = {}) {
  const copy = clone(ast)
  copy.from = Array.isArray(ast.from)
    ? ast.from.slice(0, options.fromCount ?? ast.from.length)
    : ast.from
  copy.columns = options.columns ?? '*'
  copy.where = options.includeWhere ? ast.where : null
  copy.groupby = options.includeGroupBy ? ast.groupby : null
  copy.having = options.includeHaving ? ast.having : null
  copy.distinct = options.includeDistinct ? ast.distinct : null
  copy.orderby = options.includeOrderBy ? ast.orderby : null
  copy.limit = options.includeLimit ? ast.limit : null
  copy.with = null
  copy.window = null
  copy.qualify = null
  copy._next = null
  copy.set_op = null

  return parser.sqlify(copy, MYSQL_OPTIONS).replace(/;\s*$/, '')
}

function makeGroupKeyQuery(parser, ast, includeHaving) {
  const groupExpressions = getGroupExpressions(ast)
  const columns = groupExpressions.map((expr, index) => ({ expr, as: `__visual_group_${index + 1}` }))
  return makePartialQuery(parser, ast, {
    fromCount: Array.isArray(ast.from) ? ast.from.length : 0,
    includeWhere: Boolean(ast.where),
    includeGroupBy: true,
    includeHaving,
    columns,
  })
}

function buildGroupBuckets(result, expressions, parser) {
  const buckets = new Map()
  const groupCount = expressions.length

  for (const row of result.rows) {
    const keys = row.slice(0, groupCount)
    const key = stableValue(keys)
    if (!buckets.has(key)) buckets.set(key, { keys, count: 0 })
    buckets.get(key).count += 1
  }

  const output = [...buckets.values()]
  return {
    buckets: output.map((bucket) => ({
      keys: bucket.keys,
      labels: expressions.map((expr) => expressionText(expr, parser)),
      count: bucket.count,
    })),
    result: {
      columns: [...expressions.map((expr, index) => expressionText(expr, parser) || `Group ${index + 1}`), 'Rows in group'],
      rows: output.map((bucket) => [...bucket.keys, bucket.count]),
      totalRows: output.length,
      truncated: false,
    },
  }
}

function buildGroupFlags(before, after, groupCount) {
  return before.rows.map((row) => hasMatchingGroup(row.slice(0, groupCount), after.rows, groupCount))
}

function hasMatchingGroup(keys, candidates, groupCount) {
  return candidates.some((candidate) => stableValue(candidate.slice(0, groupCount)) === stableValue(keys))
}

function explainUnsupportedQuery(ast) {
  if (ast.with) return 'Step view not available for this query yet: common table expressions (WITH) are supported for results only.'
  if (ast.window || ast.qualify) return 'Step view not available for this query yet: window functions are supported for results only.'
  if (ast._next || ast.set_op) return 'Step view not available for this query yet: UNION and other set operations are supported for results only.'
  if (!Array.isArray(ast.from) && ast.from) return 'Step view not available for this query yet: derived tables are supported for results only.'
  if (Array.isArray(ast.from) && ast.from.some((entry) => !getTableName(entry))) {
    return 'Step view not available for this query yet: subqueries and derived tables are supported for results only.'
  }
  if (containsSubquery(ast.where) || containsSubquery(ast.having)) {
    return 'Step view not available for this query yet: subqueries inside conditions are supported for results only.'
  }
  return ''
}

function containsSubquery(value) {
  if (!value || typeof value !== 'object') return false
  if (value.type === 'select' || value.ast?.type === 'select') return true
  return Object.values(value).some((child) => Array.isArray(child)
    ? child.some(containsSubquery)
    : containsSubquery(child))
}

function getGroupExpressions(ast) {
  if (!ast.groupby) return []
  if (Array.isArray(ast.groupby)) return ast.groupby
  return Array.isArray(ast.groupby.columns) ? ast.groupby.columns : []
}

function hasAggregate(value) {
  if (!value) return false
  if (Array.isArray(value)) return value.some(hasAggregate)
  if (typeof value !== 'object') return false
  if (value.type === 'aggr_func') return true
  return Object.values(value).some(hasAggregate)
}

function getReferencedColumns(value, columns = new Set()) {
  if (!value) return []
  if (Array.isArray(value)) {
    value.forEach((item) => getReferencedColumns(item, columns))
  } else if (typeof value === 'object') {
    if (value.type === 'column_ref' && typeof value.column === 'string' && value.column !== '*') {
      columns.add(value.column.toLowerCase())
    }
    Object.values(value).forEach((item) => getReferencedColumns(item, columns))
  }
  return [...columns]
}

function expressionText(expression, parser) {
  try {
    return parser.exprToSQL(expression, MYSQL_OPTIONS)
  } catch {
    try {
      return parser.sqlify({
        type: 'select', with: null, options: null, distinct: null,
        columns: [{ expr: expression, as: null }], from: null,
        where: null, groupby: null, having: null, orderby: null, limit: null,
      }, MYSQL_OPTIONS).replace(/^SELECT\s+|;$/gi, '').trim()
    } catch {
      return 'the requested expression'
    }
  }
}

function describeJoin(entry, tableName, joinType, parser) {
  const condition = entry.on ? expressionText(entry.on, parser) : entry.using?.length ? `USING (${entry.using.join(', ')})` : 'the join condition'
  const behavior = joinType.toUpperCase().includes('LEFT')
    ? 'Every left-side row stays; unmatched right-side values appear as NULL.'
    : joinType.toUpperCase().includes('RIGHT')
      ? 'Every right-side row stays; unmatched left-side values appear as NULL.'
      : 'Only pairs that satisfy the join condition remain.'
  return `${joinType} JOIN matches rows with ${condition}. ${behavior}`
}

function describeSelect(columns, parser) {
  if (!columns || columns === '*') return 'SELECT keeps all available columns for the output. The query result is now shaped for display.'
  const names = columns.map((column) => {
    const expr = expressionText(column.expr, parser)
    return column.as ? `${expr} AS ${column.as}` : expr
  })
  return `SELECT projects ${names.join(', ')} into the output. Expressions and aliases are calculated here.`
}

function getTableName(entry) {
  return entry && typeof entry.table === 'string' ? entry.table : ''
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function stableValue(value) {
  return JSON.stringify(value, (_key, item) => typeof item === 'number' && Number.isFinite(item)
    ? Math.round(item * 1e8) / 1e8
    : item)
}

function closestName(value, choices) {
  let best = ''
  let distance = Infinity
  for (const choice of choices) {
    const current = levenshtein(value, String(choice).toLowerCase())
    if (current < distance) {
      best = choice
      distance = current
    }
  }
  return distance <= Math.max(1, Math.floor(value.length * 0.32)) ? best : ''
}

function levenshtein(left, right) {
  const row = Array.from({ length: right.length + 1 }, (_item, index) => index)
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0]
    row[0] = i
    for (let j = 1; j <= right.length; j += 1) {
      const previous = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1))
      diagonal = previous
    }
  }
  return row[right.length]
}

function splitStatements(sql) {
  const statements = []
  let start = 0
  let quote = ''
  let lineComment = false
  let blockComment = false

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index]
    const next = sql[index + 1]

    if (lineComment) {
      if (char === '\n') lineComment = false
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
      if (char === quote && sql[index - 1] !== '\\') {
        if (sql[index + 1] === quote && quote !== '`') index += 1
        else quote = ''
      }
      continue
    }

    if ((char === '-' && next === '-') || char === '#') {
      lineComment = true
      if (char === '-') index += 1
    } else if (char === '/' && next === '*') {
      blockComment = true
      index += 1
    } else if (char === "'" || char === '"' || char === '`') {
      quote = char
    } else if (char === ';') {
      const part = sql.slice(start, index).trim()
      if (part) statements.push(part)
      start = index + 1
    }
  }

  const tail = sql.slice(start).trim()
  if (tail) statements.push(tail)
  return statements
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
