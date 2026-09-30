const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let target
for (let index = 0; index < 50; index += 1) {
  try {
    const targets = await fetch('http://127.0.0.1:9224/json/list').then((response) => response.json())
    target = targets.find((entry) => entry.type === 'page' && entry.url.includes('/sql-visual-lab/'))
    if (target) break
  } catch {}
  await pause(200)
}
if (!target) throw new Error('No browser page target found')

const socket = new WebSocket(target.webSocketDebuggerUrl)
let nextId = 1
const pending = new Map()
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message)
    pending.delete(message.id)
  } else if (message.method === 'Runtime.exceptionThrown') {
    console.log('PAGE_EXCEPTION', message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
  } else if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
    console.log('PAGE_LOG_ERROR', message.params.entry.text)
  }
})
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})
const send = (method, params = {}) => new Promise((resolve) => {
  const id = nextId++
  pending.set(id, resolve)
  socket.send(JSON.stringify({ id, method, params }))
})
await send('Runtime.enable')
await send('Log.enable')
const evaluate = async (expression) => {
  const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, timeout: 15000 })
  if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.text)
  return response.result?.result?.value
}
const ready = await evaluate("new Promise(resolve => { const check = () => { const message = document.querySelector('#query-message'); if (message?.textContent.includes('Database ready')) resolve({message: message.textContent, tone: message.dataset.tone, tables: document.querySelectorAll('.schema-table-button').length, retry: !document.querySelector('#retry-engine').hidden}); else setTimeout(check, 100) }; check() })")
console.log('READY', JSON.stringify(ready))
const runAndWait = async (sql) => evaluate(`new Promise(resolve => { const area = document.querySelector('#sql-editor'); if (area.CodeMirror) area.CodeMirror.setValue(${JSON.stringify(sql)}); else area.value = ${JSON.stringify(sql)}; document.querySelector('#run-query').click(); const check = () => { const message = document.querySelector('#query-message'); if (!document.querySelector('#cancel-query').hidden) return setTimeout(check, 100); resolve({message: message.textContent, tone: message.dataset.tone, rows: document.querySelectorAll('#result-content tbody tr').length, steps: document.querySelectorAll('.stepper-item').length}) }; setTimeout(check, 50) })`)
const normal = await runAndWait('SELECT name, salary FROM employees WHERE salary > 90000 ORDER BY salary DESC LIMIT 3')
console.log('SELECT', JSON.stringify(normal))
const blocked = await runAndWait('DELETE FROM employees;')
console.log('DELETE', JSON.stringify(blocked))
const stacked = await runAndWait('SELECT 1; DELETE FROM employees;')
console.log('STACKED', JSON.stringify(stacked))
const intact = await runAndWait('SELECT COUNT(*) AS employee_count FROM employees')
console.log('READ_ONLY_STILL_INTACT', JSON.stringify(intact))
console.log('FINAL_STATE', JSON.stringify(await evaluate("({message: document.querySelector('#query-message')?.textContent, disabled: document.querySelector('#run-query')?.disabled, hidden: document.querySelector('#run-query')?.hidden, text: document.querySelector('#sql-editor')?.CodeMirror?.getValue() || document.querySelector('#sql-editor')?.value, result: document.querySelector('#result-content')?.innerText})")))
socket.close()
