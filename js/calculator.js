let expr = '';
let mem  = 0;
const HIST_KEY = 'sh_calc_hist';

const exprEl   = document.getElementById('calcExpr');
const resultEl = document.getElementById('calcResult');

function appendKey(k) {
  // Replace display symbols with JS operators
  const map = { '÷':'/', '×':'*', '−':'-' };
  expr += map[k] || k;
  exprEl.textContent = expr;
}

function backspace() {
  expr = expr.slice(0, -1);
  exprEl.textContent = expr || '\u00a0';
  if (!expr) resultEl.textContent = '0';
}

function clearAll() {
  expr = '';
  exprEl.textContent = '\u00a0';
  resultEl.textContent = '0';
}

function calculate() {
  if (!expr) return;
  try {
    // Safe eval via Function
    const raw = expr
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .replace(/−/g, '-');
    const ans = Function('"use strict"; return (' + raw + ')')();
    if (!isFinite(ans)) throw new Error('Invalid');
    const display = +ans.toFixed(10);
    exprEl.textContent = expr + ' =';
    resultEl.textContent = display;
    addHistory(expr, display);
    expr = String(display);
  } catch {
    resultEl.textContent = 'Error';
    expr = '';
  }
}

function calcSci(fn) {
  if (!expr) return;
  try {
    const val = Function('"use strict"; return (' + expr + ')')();
    let ans;
    if (fn === '1/') ans = 1 / val;
    else ans = Function('"use strict"; return ' + fn + '(' + val + ')')();
    const display = +ans.toFixed(10);
    exprEl.textContent = fn.replace('Math.','') + '(' + expr + ') =';
    resultEl.textContent = display;
    addHistory(fn.replace('Math.','') + '(' + expr + ')', display);
    expr = String(display);
  } catch {
    resultEl.textContent = 'Error';
  }
}

// Memory
function storeMem() { mem = parseFloat(resultEl.textContent) || 0; toast('Stored in Memory: ' + mem, 'success'); }
function recallMem() { appendKey(String(mem)); }
function clearMem()  { mem = 0; toast('Memory cleared'); }

// Mode
function setMode(mode, btn) {
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('sciRow').classList.toggle('show', mode === 'sci');
}

// History
function addHistory(e, a) {
  const h = getHistory();
  h.unshift({ expr: e, ans: a, time: new Date().toLocaleTimeString() });
  if (h.length > 50) h.pop();
  localStorage.setItem(HIST_KEY, JSON.stringify(h));
  renderHistory();
}

function getHistory() { return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); }

function clearHistory() {
  localStorage.removeItem(HIST_KEY);
  renderHistory();
  toast('History cleared');
}

function renderHistory() {
  const list = document.getElementById('histList');
  const h = getHistory();
  if (!h.length) { list.innerHTML = '<p class="no-hist">No calculations yet.</p>'; return; }
  list.innerHTML = h.map((item, i) => `
    <div class="hist-item" onclick="useHistory(${i})">
      <div class="hist-expr">${item.expr}</div>
      <div class="hist-ans">= ${item.ans}</div>
    </div>
  `).join('');
}

function useHistory(i) {
  const h = getHistory();
  expr = String(h[i].ans);
  exprEl.textContent = h[i].expr;
  resultEl.textContent = h[i].ans;
}

// Keyboard support
document.addEventListener('keydown', e => {
  if ('0123456789'.includes(e.key)) appendKey(e.key);
  else if (e.key === '+') appendKey('+');
  else if (e.key === '-') appendKey('-');
  else if (e.key === '*') appendKey('*');
  else if (e.key === '/') { e.preventDefault(); appendKey('/'); }
  else if (e.key === '.') appendKey('.');
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace') backspace();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === '(') appendKey('(');
  else if (e.key === ')') appendKey(')');
});

renderHistory();
