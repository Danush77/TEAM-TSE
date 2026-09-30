import {
  SCHEMA_TABLES,
  buildExecutionSteps,
  createDatabase,
  executeSelect,
  findErrorLine,
  friendlyEngineError,
  getTableRows,
  inspectQuery,
} from './engine.js'

const $ = (selector) => document.querySelector(selector)
const editorTextarea = $('#sql-editor')
const queryMessage = $('#query-message')
const runButton = $('#run-query')
const clearButton = $('#clear-query')
const checkChallengeButton = $('#check-challenge')
const challengeSelect = $('#challenge-select')
const challengePrompt = $('#challenge-prompt')
const challengeFeedback = $('#challenge-feedback')
const challengeFeedbackCopy = $('#challenge-feedback-copy')
const hintButton = $('#show-hint')
const solutionButton = $('#show-solution')
const resultContent = $('#result-content')
const resultCount = $('#result-count')
const executionMeta = $('#execution-meta')
const stepView = $('#step-view')
const stepPanel = $('#panel-steps')
const resultPanel = $('#panel-result')
const stepsEmpty = $('.steps-empty')
const preview = $('#table-preview')
const schemaTables = $('#schema-tables')
const cheatsheetDialog = $('#cheatsheet-dialog')

const examples = {
  where: `SELECT name, salary
FROM employees
WHERE salary > 90000
ORDER BY salary DESC;`,
  join: `SELECT e.name, d.name AS department_name
FROM employees AS e
LEFT JOIN departments AS d ON e.department_id = d.id
ORDER BY e.name;`,
  group: `SELECT status, COUNT(*) AS order_count, SUM(amount) AS total_amount
FROM orders
GROUP BY status;`,
  having: `SELECT d.name AS department_name, COUNT(e.id) AS employee_count
FROM departments AS d
INNER JOIN employees AS e ON e.department_id = d.id
GROUP BY d.id, d.name
HAVING COUNT(e.id) >= 2
ORDER BY employee_count DESC, department_name;`,
  'order-limit': `SELECT id, amount, status
FROM orders
ORDER BY amount DESC
LIMIT 5;`,
}

let database = null
let sqlModule = null
let parser = null
let editor = null
let challenges = []
let selectedChallenge = null
let failedAttempts = 0
let lastSuccessfulRun = null
let activeStepIndex = 0
let activeSteps = []
let autoplayTimer = null
let markedErrorLine = null
let solutionVisible = false
let hintVisible = false

const codeEditor = createEditor()
configureTabs()
configureActions()
loadDependencies()

function createEditor() {
  if (window.CodeMirror && editorTextarea) {
    editor = window.CodeMirror.fromTextArea(editorTextarea, {
      mode: 'text/x-mysql',
      theme: 'material-darker',
      lineNumbers: true,
      lineWrapping: false,
      tabSize: 4,
      indentUnit: 4,
      gutters: ['CodeMirror-linenumbers', 'error-gutter'],
      extraKeys: {
        'Ctrl-Enter': () => runQuery(),
        'Cmd-Enter': () => runQuery(),
        Tab: (instance) => instance.replaceSelection('    ', 'end'),
      },
    })
    return {
      getValue: () => editor.getValue(),
      setValue: (value) => editor.setValue(value),
      clearError: clearEditorError,
      markError: markEditorError,
    }
  }

  queryMessage.textContent = 'The syntax-highlighted editor did not load. The plain text editor remains available.'
  queryMessage.dataset.tone = 'warning'
  return {
    getValue: () => editorTextarea.value,
    setValue: (value) => { editorTextarea.value = value },
    clearError: () => { editorTextarea.removeAttribute('aria-invalid') },
    markError: () => { editorTextarea.setAttribute('aria-invalid', 'true') },
  }
}

function configureTabs() {
  const tabButtons = [...document.querySelectorAll('[role="tab"]')]
  tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => activateTab(button.dataset.tab, false))
    button.addEventListener('keydown', (event) => {
      let targetIndex = null
      if (event.key === 'ArrowRight') targetIndex = (index + 1) % tabButtons.length
      if (event.key === 'ArrowLeft') targetIndex = (index - 1 + tabButtons.length) % tabButtons.length
      if (event.key === 'Home') targetIndex = 0
      if (event.key === 'End') targetIndex = tabButtons.length - 1
      if (targetIndex === null) return
      event.preventDefault()
      tabButtons[targetIndex].focus()
      activateTab(tabButtons[targetIndex].dataset.tab, false)
    })
  })
}

function activateTab(name) {
  const isSteps = name === 'steps'
  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    const active = tab.dataset.tab === name
    tab.classList.toggle('is-active', active)
    tab.setAttribute('aria-selected', String(active))
    tab.tabIndex = active ? 0 : -1
  })
  resultPanel.hidden = isSteps
  resultPanel.classList.toggle('is-active', !isSteps)
  stepPanel.hidden = !isSteps
  stepPanel.classList.toggle('is-active', isSteps)
}

function configureActions() {
  runButton.addEventListener('click', () => runQuery())
  clearButton.addEventListener('click', clearQuery)
  checkChallengeButton.addEventListener('click', () => runQuery({ checkChallenge: true }))
  $('#reset-database').addEventListener('click', resetDatabase)
  $('#cheatsheet-button').addEventListener('click', () => cheatsheetDialog.showModal())

  $('#example-select').addEventListener('change', (event) => {
    const example = examples[event.target.value]
    if (example) {
      codeEditor.setValue(example)
      codeEditor.clearError()
      setQueryMessage('Example loaded. Run it to see the intermediate data.', 'neutral')
      editor?.focus()
    }
    event.target.value = ''
  })

  challengeSelect.addEventListener('change', () => selectChallenge(challengeSelect.value))
  hintButton.addEventListener('click', toggleHint)
  solutionButton.addEventListener('click', toggleSolution)
}

async function loadDependencies() {
  if (!window.initSqlJs) {
    showFatalError('The in-browser SQL engine did not load. Check your connection to the CDN, then refresh this page.')
    return
  }

  try {
    const schemaResponse = await fetch(new URL('./schema.sql', import.meta.url))
    if (!schemaResponse.ok) throw new Error(`Could not load the sample schema (${schemaResponse.status}).`)
    const [schemaSql, challengeResponse] = await Promise.all([
      schemaResponse.text(),
      fetch(new URL('./challenges.json', import.meta.url)),
    ])
    sqlModule = await window.initSqlJs({
      locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`,
    })
    database = await createDatabase(sqlModule, schemaSql)

    if (challengeResponse.ok) {
      challenges = await challengeResponse.json()
      populateChallenges()
    }
    parser = window.NodeSQLParser?.Parser ? new window.NodeSQLParser.Parser() : null
    renderSchemaTables()
    setQueryMessage('Database ready. Try the example or choose a table to explore.', 'success')

    if (!parser) {
      setQueryMessage('The query parser did not load. Queries can still run, but the step-by-step view is unavailable.', 'warning')
    }
  } catch (error) {
    showFatalError(error.message || 'The SQL learning lab could not start. Refresh the page and try again.')
  }
}

async function resetDatabase() {
  if (!sqlModule) return
  try {
    const response = await fetch(new URL('./schema.sql', import.meta.url))
    if (!response.ok) throw new Error('The sample data could not be reloaded.')
    const schemaSql = await response.text()
    database?.close()
    database = await createDatabase(sqlModule, schemaSql)
    lastSuccessfulRun = null
    clearEditorError()
    renderSchemaTables()
    preview.replaceChildren(createNode('p', 'preview-placeholder', 'Choose a table above to inspect a few rows.'))
    setQueryMessage('Sample database reset. Your next query starts with the original data.', 'success')
  } catch (error) {
    setQueryMessage(error.message || 'Could not reset the sample database.', 'error')
  }
}

function renderSchemaTables() {
  schemaTables.replaceChildren()
  Object.entries(SCHEMA_TABLES).forEach(([tableName, columns]) => {
    const button = createNode('button', 'schema-table-button')
    button.type = 'button'
    button.setAttribute('aria-expanded', 'false')
    button.dataset.table = tableName
    button.append(createNode('span', 'table-glyph', '▤'))
    const label = createNode('span', 'schema-table-label')
    label.append(createNode('strong', '', tableName))
    label.append(createNode('small', '', `${columns.length} columns`))
    button.append(label)
    button.append(createNode('span', 'schema-chevron', '›'))
    button.addEventListener('click', () => showTablePreview(tableName, button))
    schemaTables.append(button)
  })
}

function showTablePreview(tableName, activeButton) {
  document.querySelectorAll('.schema-table-button').forEach((button) => {
    const active = button === activeButton
    button.classList.toggle('is-selected', active)
    button.setAttribute('aria-expanded', String(active))
  })

  try {
    const result = getTableRows(database, tableName, 5)
    preview.replaceChildren()
    const heading = createNode('div', 'preview-heading')
    heading.append(createNode('h3', '', `${tableName} <span>sample</span>`))
    const tryButton = createNode('button', 'text-button', 'Use in editor')
    tryButton.type = 'button'
    tryButton.addEventListener('click', () => {
      codeEditor.setValue(`SELECT *\nFROM ${tableName}\nLIMIT 5;`)
      editor?.focus()
    })
    heading.append(tryButton)
    preview.append(heading, renderTable(result, { compact: true, rowLimit: 5 }))
  } catch (error) {
    preview.replaceChildren(createNode('p', 'preview-placeholder', error.message))
  }
}

function populateChallenges() {
  for (const challenge of challenges) {
    const option = document.createElement('option')
    option.value = challenge.id
    option.textContent = `${challenge.difficulty} · ${challenge.title}`
    challengeSelect.append(option)
  }
}

function selectChallenge(challengeId) {
  selectedChallenge = challenges.find((challenge) => challenge.id === challengeId) || null
  failedAttempts = 0
  solutionVisible = false
  hintVisible = false
  lastSuccessfulRun = null
  solutionButton.hidden = true
  solutionButton.textContent = 'Show solution'
  checkChallengeButton.hidden = !selectedChallenge
  hintButton.hidden = !selectedChallenge
  challengeFeedback.hidden = !selectedChallenge
  challengeFeedbackCopy.replaceChildren()
  challengePrompt.textContent = selectedChallenge
    ? `${selectedChallenge.difficulty} · ${selectedChallenge.description}`
    : 'Choose a challenge to practice and check your result.'
  challengePrompt.classList.toggle('has-challenge', Boolean(selectedChallenge))
}

function toggleHint() {
  if (!selectedChallenge) return
  hintVisible = !hintVisible
  hintButton.textContent = hintVisible ? 'Hide hint' : 'Show hint'
  const oldHint = challengeFeedbackCopy.querySelector('.hint-copy')
  oldHint?.remove()
  if (hintVisible) challengeFeedbackCopy.append(createNode('p', 'hint-copy', `Hint: ${selectedChallenge.hint}`))
}

function toggleSolution() {
  if (!selectedChallenge || failedAttempts < 2) return
  solutionVisible = !solutionVisible
  solutionButton.textContent = solutionVisible ? 'Hide solution' : 'Show solution'
  challengeFeedbackCopy.querySelector('.solution-copy')?.remove()
  if (solutionVisible) {
    const solution = createNode('pre', 'solution-copy')
    solution.append(createNode('code', '', selectedChallenge.solution))
    challengeFeedbackCopy.append(solution)
  }
}

function clearQuery() {
  codeEditor.setValue('')
  codeEditor.clearError()
  lastSuccessfulRun = null
  activeSteps = []
  resultCount.textContent = ''
  executionMeta.textContent = ''
  resultContent.replaceChildren(createEmptyState('Your query result will appear here', 'Write a SELECT query and run it to see the returned records.'))
  renderStepUnavailable('Run a query to reveal its logical steps and the rows produced at each stage.')
  setQueryMessage('Editor cleared.', 'neutral')
}

function runQuery({ checkChallenge = false } = {}) {
  const sql = codeEditor.getValue()
  clearEditorError()
  stopAutoplay()

  let inspection
  try {
    inspection = inspectQuery(sql, parser)
  } catch (error) {
    const line = findErrorLine(sql, error)
    markEditorError(line)
    setQueryMessage(error.message, 'error')
    return null
  }

  const startedAt = performance.now()
  let result
  try {
    result = executeSelect(database, sql)
  } catch (error) {
    const columns = Object.values(SCHEMA_TABLES).flat().map(([name]) => name)
    const line = findErrorLine(sql, error)
    markEditorError(line)
    setQueryMessage(friendlyEngineError(error, columns), 'error')
    return null
  }

  const elapsed = performance.now() - startedAt
  let stepPlan = { available: false, steps: [], reason: inspection.reason || 'Step view not available for this query yet.' }
  if (inspection.ast && inspection.visualizationAvailable) {
    stepPlan = buildExecutionSteps(parser, inspection.ast, database)
  }

  lastSuccessfulRun = { sql, result, ast: inspection.ast, stepPlan, elapsed }
  renderResult(result)
  executionMeta.textContent = `${elapsed.toFixed(1)} ms`
  resultCount.textContent = `${result.totalRows} ${result.totalRows === 1 ? 'row' : 'rows'}`
  setQueryMessage(
    stepPlan.available
      ? 'Query complete. Follow the steps to see how the rows changed.'
      : 'Query complete. The final result is ready; this query has no step breakdown.',
    stepPlan.available ? 'success' : 'warning',
  )

  if (stepPlan.available) {
    renderSteps(stepPlan.steps)
    activateTab('steps')
  } else {
    renderStepUnavailable(stepPlan.reason || 'Step view not available for this query yet. The final result is still shown.')
    activateTab('result')
  }

  if (checkChallenge) gradeChallenge(result)
  return result
}

function gradeChallenge(result) {
  if (!selectedChallenge || !database) return
  let expected
  try {
    expected = executeSelect(database, selectedChallenge.expectedResult.query)
  } catch {
    setFeedback('The reference result for this challenge could not be loaded. Reset the database and try again.', 'error')
    return
  }

  const matches = compareResults(result, expected, selectedChallenge.expectedResult.orderMatters)
  if (matches) {
    setFeedback('Correct. Your result matches the expected records and columns.', 'success')
    return
  }

  failedAttempts += 1
  solutionButton.hidden = failedAttempts < 2
  solutionVisible = false
  solutionButton.textContent = 'Show solution'
  challengeFeedbackCopy.querySelector('.solution-copy')?.remove()
  setFeedback(`Not quite yet. Your query ran and returned ${result.totalRows} ${result.totalRows === 1 ? 'row' : 'rows'}. Check the required columns and values, then try again.`, 'error')
}

function setFeedback(message, tone) {
  const feedbackText = createNode('p', 'feedback-message', message)
  feedbackText.dataset.tone = tone
  const hint = challengeFeedbackCopy.querySelector('.hint-copy')
  const solution = challengeFeedbackCopy.querySelector('.solution-copy')
  challengeFeedbackCopy.replaceChildren(feedbackText)
  if (hintVisible && selectedChallenge) challengeFeedbackCopy.append(createNode('p', 'hint-copy', `Hint: ${selectedChallenge.hint}`))
  if (solutionVisible && solution) challengeFeedbackCopy.append(solution)
  challengeFeedback.hidden = false
}

function compareResults(actual, expected, orderMatters) {
  const actualHeaders = actual.columns.map(normalizeColumn)
  const expectedHeaders = expected.columns.map(normalizeColumn)
  if (actualHeaders.length !== expectedHeaders.length) return false
  if (actualHeaders.slice().sort().join('|') !== expectedHeaders.slice().sort().join('|')) return false

  const sortIndexes = (headers) => headers.map((name, index) => ({ name, index }))
    .sort((left, right) => left.name.localeCompare(right.name) || left.index - right.index)
    .map(({ index }) => index)
  const actualOrder = sortIndexes(actualHeaders)
  const expectedOrder = sortIndexes(expectedHeaders)
  const normalizeRows = (rows, order) => rows.map((row) => order.map((index) => normalizeCell(row[index])))
  const actualRows = normalizeRows(actual.rows, actualOrder)
  const expectedRows = normalizeRows(expected.rows, expectedOrder)

  if (actualRows.length !== expectedRows.length) return false
  if (orderMatters) {
    return actualRows.every((row, index) => stableJson(row) === stableJson(expectedRows[index]))
  }

  return actualRows.map(stableJson).sort().every((row, index) => row === expectedRows.map(stableJson).sort()[index])
}

function normalizeColumn(column) {
  return String(column).trim().replace(/[`"\[\]]/g, '').toLowerCase()
}

function normalizeCell(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value * 1e8) / 1e8
  return value
}

function stableJson(value) {
  return JSON.stringify(value)
}

function renderResult(result) {
  resultContent.replaceChildren()
  if (!result.rows.length) {
    resultContent.append(createEmptyState('No rows matched', 'The query ran successfully and returned an empty result set.'))
    return
  }
  resultContent.append(renderTable(result))
}

function renderSteps(steps) {
  activeSteps = steps
  activeStepIndex = 0
  stepView.replaceChildren()
  stepsEmpty.hidden = true
  stepView.hidden = false

  const stepper = createNode('div', 'stepper-track')
  stepper.setAttribute('aria-label', 'Logical query steps')
  stepper.setAttribute('role', 'list')
  steps.forEach((step, index) => {
    const button = createNode('button', 'stepper-item')
    button.type = 'button'
    button.setAttribute('role', 'listitem')
    button.setAttribute('aria-pressed', String(index === 0))
    button.dataset.stepIndex = String(index)
    button.append(createNode('span', 'stepper-number', String(index + 1).padStart(2, '0')))
    button.append(createNode('span', 'stepper-label', step.title))
    button.addEventListener('click', () => showStep(index))
    stepper.append(button)
  })
  stepView.append(stepper)

  const navigation = createNode('div', 'step-navigation')
  const previousButton = createNode('button', 'button button--quiet', '← Previous')
  previousButton.type = 'button'
  previousButton.dataset.stepControl = 'previous'
  previousButton.addEventListener('click', () => showStep(Math.max(0, activeStepIndex - 1)))
  const stepPosition = createNode('p', 'step-position')
  stepPosition.setAttribute('aria-live', 'polite')
  const autoplayButton = createNode('button', 'button button--quiet', '▶ Auto-play')
  autoplayButton.type = 'button'
  autoplayButton.dataset.stepControl = 'autoplay'
  autoplayButton.addEventListener('click', toggleAutoplay)
  const nextButton = createNode('button', 'button button--quiet', 'Next →')
  nextButton.type = 'button'
  nextButton.dataset.stepControl = 'next'
  nextButton.addEventListener('click', () => showStep(Math.min(activeSteps.length - 1, activeStepIndex + 1)))
  navigation.append(previousButton, stepPosition, autoplayButton, nextButton)
  stepView.append(navigation)
  const detail = createNode('article', 'step-detail')
  detail.setAttribute('aria-live', 'polite')
  detail.id = 'step-detail'
  stepView.append(detail)
  showStep(0)
}

function showStep(index) {
  if (!activeSteps.length) return
  activeStepIndex = Math.max(0, Math.min(index, activeSteps.length - 1))
  const step = activeSteps[activeStepIndex]

  document.querySelectorAll('.stepper-item').forEach((button, buttonIndex) => {
    const active = buttonIndex === activeStepIndex
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-pressed', String(active))
  })
  const previous = $('[data-step-control="previous"]')
  const next = $('[data-step-control="next"]')
  if (previous) previous.disabled = activeStepIndex === 0
  if (next) next.disabled = activeStepIndex === activeSteps.length - 1
  const position = $('.step-position')
  if (position) position.textContent = `Step ${activeStepIndex + 1} of ${activeSteps.length}`

  const detail = $('#step-detail')
  detail.replaceChildren()
  const header = createNode('div', 'step-detail-header')
  const titleGroup = createNode('div', '')
  titleGroup.append(createNode('p', 'eyebrow eyebrow--small', `LOGICAL STEP ${String(activeStepIndex + 1).padStart(2, '0')}`))
  titleGroup.append(createNode('h3', '', step.title))
  header.append(titleGroup)
  const rowCounts = createNode('div', 'row-counts')
  const inputCount = step.filterInput?.totalRows ?? step.input?.totalRows
  const outputCount = step.result.totalRows
  if (inputCount !== undefined) {
    rowCounts.append(createNode('span', 'count-chip', `${inputCount} in`))
    rowCounts.append(createNode('span', 'count-arrow', '→'))
  }
  rowCounts.append(createNode('span', 'count-chip count-chip--accent', `${outputCount} ${outputCount === 1 ? 'row' : 'rows'} out`))
  header.append(rowCounts)
  detail.append(header, createNode('p', 'step-explanation', step.description))

  if (step.kind === 'join') renderJoinVisual(detail, step)
  else if (step.kind === 'groups') renderGroupVisual(detail, step)
  else if (step.id === 'where') renderWhereVisual(detail, step)
  else if (step.id === 'having') renderHavingVisual(detail, step)
  else if (step.kind === 'order') renderOrderVisual(detail, step)
  else if (step.kind === 'limit') renderLimitVisual(detail, step)
  else if (step.id === 'select') renderProjectionVisual(detail, step)
  else renderStandardVisual(detail, step)

  const sqlNote = createNode('details', 'step-sql')
  const sqlSummary = createNode('summary', '', 'SQL used for this stage')
  const sqlBlock = createNode('pre', 'step-sql-code')
  sqlBlock.append(createNode('code', '', step.sql))
  sqlNote.append(sqlSummary, sqlBlock)
  detail.append(sqlNote)
}

function renderWhereVisual(parent, step) {
  const input = step.filterInput || step.input
  parent.append(createNode('h4', 'visual-subheading', 'Rows checked by WHERE'))
  parent.append(createNode('p', 'visual-caption', '✓ Kept rows match the condition. × Removed rows did not match it.'))
  parent.append(renderTable(input, {
    rowStatus: (index) => Boolean(step.filterFlags?.[index]),
    statusKept: 'Kept',
    statusRemoved: 'Filtered out',
    reason: `Does not match: ${step.filterReason}`,
  }))
}

function renderJoinVisual(parent, step) {
  const input = step.input || { columns: [], rows: [], totalRows: 0 }
  const comparison = createNode('div', 'join-comparison')
  const left = createNode('section', 'comparison-card')
  left.append(createNode('div', 'comparison-heading', 'Left-side rows'))
  left.append(renderTable(input, { compact: true, rowLimit: 20 }))
  const right = createNode('section', 'comparison-card')
  right.append(createNode('div', 'comparison-heading', `${step.joinTable} join source`))
  right.append(renderTable(step.joinRight || { columns: [], rows: [], totalRows: 0 }, { compact: true, rowLimit: 8 }))
  comparison.append(left, createNode('div', 'join-connector', '↔'), right)
  parent.append(createNode('h4', 'visual-subheading', 'Match related records'))
  parent.append(comparison)

  const output = createNode('section', 'join-output')
  output.append(createNode('div', 'comparison-heading', `${step.joinType} JOIN result · ${step.result.totalRows} rows`))
  const leftColumns = input.columns.length
  output.append(renderTable(step.result, {
    rowLimit: 40,
    rowStatus: (index) => {
      const rightValues = step.result.rows[index]?.slice(leftColumns) || []
      return rightValues.some((value) => value !== null) ? true : false
    },
    statusKept: 'Matched',
    statusRemoved: 'No right match',
    showStatus: step.joinType.toUpperCase().includes('LEFT') || step.joinType.toUpperCase().includes('RIGHT'),
  }))
  parent.append(output)
}

function renderGroupVisual(parent, step) {
  parent.append(createNode('h4', 'visual-subheading', 'Rows collected into groups'))
  const groupGrid = createNode('div', 'group-grid')
  if (!step.buckets.length) {
    groupGrid.append(createNode('p', 'empty-inline', 'No groups were created from these rows.'))
  }
  step.buckets.slice(0, 40).forEach((bucket, index) => {
    const card = createNode('article', 'group-card')
    const cardHead = createNode('div', 'group-card-head')
    cardHead.append(createNode('span', 'group-number', `Group ${index + 1}`))
    cardHead.append(createNode('span', 'group-size', `${bucket.count} ${bucket.count === 1 ? 'row' : 'rows'}`))
    card.append(cardHead)
    bucket.keys.forEach((value, keyIndex) => {
      const key = createNode('p', 'group-key')
      key.append(createNode('span', 'group-key-label', `${bucket.labels[keyIndex]} = `))
      appendValue(key, value)
      card.append(key)
    })
    groupGrid.append(card)
  })
  parent.append(groupGrid)
  parent.append(createNode('p', 'visual-caption', `${step.buckets.length} groups were formed from ${step.input?.totalRows ?? 0} incoming rows.`))
}

function renderHavingVisual(parent, step) {
  const input = step.filterInput || step.input
  parent.append(createNode('h4', 'visual-subheading', 'Groups before and after HAVING'))
  parent.append(createNode('p', 'visual-caption', `Groups marked “Filtered out” did not pass: ${step.filterReason}`))
  parent.append(renderTable(input, {
    rowStatus: (_index, row) => rowAppearsIn(row, step.result.rows),
    statusKept: 'Kept group',
    statusRemoved: 'Filtered out',
    reason: `Group did not match: ${step.filterReason}`,
  }))
  if (step.groupBuckets?.length) {
    const badges = createNode('div', 'group-status-list')
    step.groupBuckets.forEach((bucket) => {
      const badge = createNode('span', `group-status ${bucket.kept ? 'is-kept' : 'is-removed'}`)
      badge.append(createNode('span', 'status-symbol', bucket.kept ? '✓' : '×'))
      bucket.keys.forEach((value, index) => {
        if (index) badge.append(createNode('span', 'group-key-separator', '·'))
        appendValue(badge, value)
      })
      badge.append(createNode('small', '', bucket.kept ? 'kept' : 'removed'))
      badges.append(badge)
    })
    parent.append(badges)
  }
}

function renderProjectionVisual(parent, step) {
  if (!step.input) {
    renderStandardVisual(parent, step)
    return
  }
  const comparison = createNode('div', 'projection-comparison')
  const source = createNode('section', 'comparison-card')
  source.append(createNode('div', 'comparison-heading', 'Available input columns'))
  source.append(renderTable(step.input, {
    compact: true,
    rowLimit: 12,
    selectedColumns: step.selectedColumns,
  }))
  const output = createNode('section', 'comparison-card')
  output.append(createNode('div', 'comparison-heading', 'Selected output columns'))
  output.append(renderTable(step.result, { compact: true, rowLimit: 12 }))
  comparison.append(source, createNode('div', 'projection-arrow', '→'), output)
  parent.append(createNode('h4', 'visual-subheading', 'Projection'))
  parent.append(comparison)
}

function renderOrderVisual(parent, step) {
  const input = step.input
  parent.append(createNode('h4', 'visual-subheading', 'Rows in their sorted order'))
  parent.append(createNode('p', 'visual-caption', 'The arrows show the requested sort direction. Row positions now follow ORDER BY.'))
  const directions = step.description.match(/\b(?:ASC|DESC)\b/gi) || []
  const direction = directions[0]?.toUpperCase() === 'DESC' ? '↓ DESC' : '↑ ASC'
  parent.append(createNode('div', 'sort-direction', `${direction} · ${step.result.totalRows} rows`))
  parent.append(renderTable(step.result, { rowLimit: 40, numbered: true }))
  if (input && step.result.rows.length === 0) parent.append(createNode('p', 'empty-inline', 'There were no rows to sort.'))
}

function renderLimitVisual(parent, step) {
  const input = step.filterInput || step.input
  const retainedKeys = countRows(step.result.rows)
  const flags = input.rows.map((row) => {
    const key = stableJson(row)
    const remaining = retainedKeys.get(key) || 0
    if (remaining > 0) {
      retainedKeys.set(key, remaining - 1)
      return true
    }
    return false
  })
  parent.append(createNode('h4', 'visual-subheading', 'The cutoff line'))
  parent.append(createNode('p', 'visual-caption', `${step.result.totalRows} rows are kept; ${Math.max(0, input.totalRows - step.result.totalRows)} rows fall after the LIMIT.`))
  parent.append(renderTable(input, {
    rowStatus: (index) => flags[index],
    statusKept: 'Included',
    statusRemoved: 'After cutoff',
    reason: 'Outside the row limit',
    cutoffAfter: flags.lastIndexOf(true),
    showCutoff: input.rows.length > step.result.rows.length,
  }))
}

function renderStandardVisual(parent, step) {
  if (step.kind === 'order') return renderOrderVisual(parent, step)
  if (!step.result.rows.length) {
    parent.append(createEmptyState('No rows at this step', 'The query is valid, but no rows remain after the previous clauses.'))
  } else {
    parent.append(renderTable(step.result, { rowLimit: 40 }))
  }
}

function renderTable(result, options = {}) {
  const wrapper = createNode('div', `data-table-wrap${options.compact ? ' data-table-wrap--compact' : ''}`)
  if (!result || !result.columns?.length) {
    wrapper.append(createNode('p', 'empty-inline', 'No columns to display.'))
    return wrapper
  }

  const limit = Math.max(1, options.rowLimit || 100)
  const rows = (result.rows || []).slice(0, limit)
  const table = createNode('table', 'data-table')
  const head = createNode('thead')
  const heading = createNode('tr')
  if (options.showStatus || options.rowStatus) heading.append(createNode('th', 'row-status-heading', 'Row status'))
  if (options.numbered) heading.append(createNode('th', 'row-number-heading', '#'))
  result.columns.forEach((column) => {
    const cell = createNode('th', '', column)
    if (options.selectedColumns && options.selectedColumns.length) {
      const normalized = normalizeColumn(column)
      const isSelected = options.selectedColumns.some((name) => name === normalized || normalized.endsWith(`.${name}`))
      if (!isSelected) cell.classList.add('column-muted')
    }
    heading.append(cell)
  })
  head.append(heading)

  const body = createNode('tbody')
  rows.forEach((row, index) => {
    const tr = createNode('tr')
    const kept = options.rowStatus ? options.rowStatus(index, row) : null
    if (options.showStatus || options.rowStatus) {
      const statusCell = createNode('td', `row-status-cell ${kept ? 'row-is-kept' : kept === false ? 'row-is-removed' : ''}`)
      if (kept === true) statusCell.append(createNode('span', 'status-symbol', '✓'), createNode('span', '', options.statusKept || 'Kept'))
      else if (kept === false) {
        statusCell.append(createNode('span', 'status-symbol', '×'), createNode('span', '', options.statusRemoved || 'Removed'))
        if (options.reason) statusCell.append(createNode('small', 'reason-tag', options.reason))
      } else statusCell.append(createNode('span', '', '—'))
      tr.append(statusCell)
      if (kept === false) tr.classList.add('row-filtered')
      if (kept === true) tr.classList.add('row-retained')
    }
    if (options.numbered) tr.append(createNode('td', 'row-index', String(index + 1)))
    row.forEach((value, columnIndex) => {
      const cell = createNode('td')
      if (options.selectedColumns && options.selectedColumns.length) {
        const normalized = normalizeColumn(result.columns[columnIndex])
        const isSelected = options.selectedColumns.some((name) => name === normalized || normalized.endsWith(`.${name}`))
        if (!isSelected) cell.classList.add('column-muted')
      }
      appendValue(cell, value)
      tr.append(cell)
    })
    body.append(tr)
    if (options.showCutoff && index === options.cutoffAfter) {
      const cutoff = createNode('tr', 'cutoff-row')
      const cell = createNode('td', '', 'LIMIT cutoff')
      cell.colSpan = heading.children.length
      cutoff.append(cell)
      body.append(cutoff)
    }
  })
  table.append(head, body)
  wrapper.append(table)

  const total = result.totalRows ?? result.rows?.length ?? 0
  if (total > rows.length || result.truncated) {
    wrapper.append(createNode('p', 'table-overflow-note', `Showing ${rows.length} of ${total} rows.`))
  }
  return wrapper
}

function appendValue(parent, value) {
  if (value === null || value === undefined) {
    const nullValue = createNode('span', 'null-value', 'NULL')
    nullValue.setAttribute('aria-label', 'NULL value')
    parent.append(nullValue)
  } else if (typeof value === 'number') {
    parent.append(createNode('span', 'numeric-value', Number.isInteger(value) ? String(value) : value.toLocaleString(undefined, { maximumFractionDigits: 4 })))
  } else {
    parent.append(document.createTextNode(String(value)))
  }
}

function renderStepUnavailable(message) {
  activeSteps = []
  stepView.hidden = true
  stepView.replaceChildren()
  stepsEmpty.hidden = false
  stepsEmpty.replaceChildren(
    createNode('span', 'empty-icon', '⌁'),
    createNode('h3', '', 'Step view not available'),
    createNode('p', '', message),
  )
}

function createEmptyState(title, description) {
  const state = createNode('div', 'empty-state')
  state.append(createNode('span', 'empty-icon', '▤'))
  state.append(createNode('h3', '', title))
  state.append(createNode('p', '', description))
  return state
}

function createNode(tagName, className = '', text = '') {
  const node = document.createElement(tagName)
  if (className) node.className = className
  if (text !== undefined && text !== null) node.textContent = text
  return node
}

function setQueryMessage(message, tone = 'neutral') {
  queryMessage.textContent = message
  queryMessage.dataset.tone = tone
}

function showFatalError(message) {
  setQueryMessage(message, 'error')
  runButton.disabled = true
  checkChallengeButton.disabled = true
  schemaTables.replaceChildren(createNode('p', 'loading-copy', 'The sample database is not available.'))
}

function markEditorError(lineIndex) {
  if (!editor) {
    codeEditor.markError()
    return
  }
  const line = Math.max(0, Math.min(lineIndex, editor.lineCount() - 1))
  markedErrorLine = line
  editor.addLineClass(line, 'background', 'cm-error-line')
  const marker = createNode('span', 'error-marker', '●')
  marker.title = 'Query error on this line'
  editor.setGutterMarker(line, 'error-gutter', marker)
  editor.scrollIntoView({ line, ch: 0 }, 100)
}

function clearEditorError() {
  if (editor && markedErrorLine !== null) {
    editor.removeLineClass(markedErrorLine, 'background', 'cm-error-line')
    editor.setGutterMarker(markedErrorLine, 'error-gutter', null)
  } else if (!editor) {
    editorTextarea.removeAttribute('aria-invalid')
  }
  markedErrorLine = null
}

function toggleAutoplay() {
  if (autoplayTimer) {
    stopAutoplay()
    return
  }
  const button = $('[data-step-control="autoplay"]')
  if (!button || activeSteps.length < 2) return
  button.textContent = 'Ⅱ Pause'
  autoplayTimer = window.setInterval(() => {
    if (activeStepIndex >= activeSteps.length - 1) {
      stopAutoplay()
      return
    }
    showStep(activeStepIndex + 1)
  }, 1500)
}

function stopAutoplay() {
  if (autoplayTimer) window.clearInterval(autoplayTimer)
  autoplayTimer = null
  const button = $('[data-step-control="autoplay"]')
  if (button) button.textContent = '▶ Auto-play'
}

function rowAppearsIn(row, candidates) {
  const counts = countRows(candidates)
  const key = stableJson(row)
  const remaining = counts.get(key) || 0
  if (remaining <= 0) return false
  counts.set(key, remaining - 1)
  return true
}

function countRows(rows) {
  const counts = new Map()
  for (const row of rows || []) {
    const key = stableJson(row)
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return counts
}
