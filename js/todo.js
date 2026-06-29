const TODO_KEY = 'sh_todos';
let filter = 'all';

function getTodos()  { return JSON.parse(localStorage.getItem(TODO_KEY) || '[]'); }
function saveTodos(t){ localStorage.setItem(TODO_KEY, JSON.stringify(t)); }

function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  if (!text) { toast('Please enter a task!', 'warning'); return; }
  const todos = getTodos();
  todos.unshift({
    id: Date.now(),
    text,
    cat: document.getElementById('taskCat').value,
    pri: document.getElementById('taskPri').value,
    due: document.getElementById('taskDue').value,
    done: false,
    created: new Date().toISOString()
  });
  saveTodos(todos);
  document.getElementById('taskInput').value = '';
  document.getElementById('taskDue').value = '';
  render();
  toast('Task added! ✅', 'success');
}

function toggleTask(id) {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (t) { t.done = !t.done; saveTodos(todos); render(); }
}

function deleteTask(id) {
  saveTodos(getTodos().filter(x => x.id !== id));
  render();
  toast('Task removed', 'danger');
}

function editTask(id) {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) return;
  const newText = prompt('Edit task:', t.text);
  if (newText && newText.trim()) {
    t.text = newText.trim();
    saveTodos(todos);
    render();
    toast('Task updated!', 'success');
  }
}

function clearDone() {
  saveTodos(getTodos().filter(x => !x.done));
  render();
  toast('Done tasks cleared');
}

function setFilter(f, btn) {
  filter = f;
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function render() {
  const todos = getTodos();
  const catF = document.getElementById('filterCat').value;

  let filtered = todos.filter(t => {
    const catOk = !catF || t.cat === catF;
    if (filter === 'active') return !t.done && catOk;
    if (filter === 'done')   return  t.done && catOk;
    return catOk;
  });

  const today = new Date().toISOString().split('T')[0];

  document.getElementById('cntAll').textContent    = todos.filter(t => !catF || t.cat === catF).length;
  document.getElementById('cntActive').textContent = todos.filter(t => !t.done && (!catF || t.cat === catF)).length;
  document.getElementById('cntDone').textContent   = todos.filter(t =>  t.done && (!catF || t.cat === catF)).length;

  const list = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');

  if (!filtered.length) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  const priIcon = { High:'🔴', Medium:'🟡', Low:'🟢' };
  const catIcon = { Study:'📚', Personal:'🏠', Work:'💼', Health:'🏃', Other:'🔖' };

  list.innerHTML = filtered.map(t => {
    const overdue = t.due && t.due < today && !t.done;
    const dueStr  = t.due ? (overdue ? '⚠️ Overdue: ' : '📅 ') + t.due : '';
    return `<div class="task-item ${t.done?'done':''} pri-${t.pri}">
      <div class="task-check ${t.done?'checked':''}" onclick="toggleTask(${t.id})">${t.done?'✓':''}</div>
      <div class="task-body">
        <div class="task-text">${escHtml(t.text)}</div>
        <div class="task-meta">
          <span class="task-cat">${catIcon[t.cat]||''} ${t.cat}</span>
          <span class="badge badge-${t.pri==='High'?'danger':t.pri==='Medium'?'warning':'success'}">${priIcon[t.pri]} ${t.pri}</span>
          ${dueStr ? `<span class="task-due ${overdue?'overdue':''}">${dueStr}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="task-btn" onclick="editTask(${t.id})" title="Edit">✏️</button>
        <button class="task-btn del" onclick="deleteTask(${t.id})" title="Delete">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Enter to add
document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

render();
