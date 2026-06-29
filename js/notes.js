const NOTES_KEY = 'sh_notes';
let activeId = null;

function getNotes()  { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); }
function saveNotes(n){ localStorage.setItem(NOTES_KEY, JSON.stringify(n)); }

function newNote() {
  const notes = getNotes();
  const note = {
    id: Date.now(),
    title: 'Untitled Note',
    content: '',
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
  notes.unshift(note);
  saveNotes(notes);
  openNote(note.id);
  renderList();
}

function openNote(id) {
  const note = getNotes().find(n => n.id === id);
  if (!note) return;
  activeId = id;

  document.getElementById('editorPlaceholder').style.display = 'none';
  const area = document.getElementById('editorArea');
  area.style.display = 'flex';
  area.style.flexDirection = 'column';
  area.style.height = '100%';

  document.getElementById('noteTitleInput').value = note.title;
  document.getElementById('noteEditor').innerHTML = note.content;
  document.getElementById('noteMeta').textContent =
    'Created: ' + new Date(note.created).toLocaleDateString() +
    '  |  Updated: ' + new Date(note.updated).toLocaleString();

  updateWordCount();
  renderList();
}

function saveNote() {
  if (!activeId) return;
  const notes = getNotes();
  const note = notes.find(n => n.id === activeId);
  if (!note) return;
  note.title = document.getElementById('noteTitleInput').value.trim() || 'Untitled Note';
  note.content = document.getElementById('noteEditor').innerHTML;
  note.updated = new Date().toISOString();
  saveNotes(notes);
  renderList();
  toast('Note saved! 💾', 'success');
}

function deleteNote() {
  if (!activeId) return;
  if (!confirm('Delete this note?')) return;
  saveNotes(getNotes().filter(n => n.id !== activeId));
  activeId = null;
  document.getElementById('editorPlaceholder').style.display = 'flex';
  document.getElementById('editorArea').style.display = 'none';
  renderList();
  toast('Note deleted', 'danger');
}

function downloadNote() {
  if (!activeId) return;
  const title = document.getElementById('noteTitleInput').value || 'note';
  const text = document.getElementById('noteEditor').innerText;
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = title.replace(/\s+/g, '_') + '.txt';
  a.click();
}

function fmt(cmd) {
  document.getElementById('noteEditor').focus();
  document.execCommand(cmd, false, null);
  updateWordCount();
}

function fmtList(type) {
  document.getElementById('noteEditor').focus();
  document.execCommand('insert' + (type === 'ul' ? 'UnorderedList' : 'OrderedList'), false, null);
}

function updateWordCount() {
  const text = document.getElementById('noteEditor').innerText || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById('wordCount').textContent = words + ' words';
}

document.getElementById('noteEditor').addEventListener('input', () => {
  updateWordCount();
  // Auto-save after 2s idle
  clearTimeout(window._saveTimer);
  window._saveTimer = setTimeout(saveNote, 2000);
});

// Keyboard save
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNote(); }
});

function renderList() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const notes = getNotes().filter(n =>
    n.title.toLowerCase().includes(query) ||
    (n.content || '').toLowerCase().includes(query)
  );

  document.getElementById('noteCount').textContent = getNotes().length;

  const list = document.getElementById('noteList');
  if (!notes.length) {
    list.innerHTML = '<p style="color:var(--text-light);font-size:.85rem;text-align:center;padding:16px">No notes found.</p>';
    return;
  }

  list.innerHTML = notes.map(n => `
    <div class="note-item ${n.id === activeId ? 'active' : ''}" onclick="openNote(${n.id})">
      <div class="note-item-title">${escHtml(n.title)}</div>
      <div class="note-item-preview">${stripHtml(n.content).substring(0,60) || 'Empty note'}</div>
      <div class="note-item-date">${new Date(n.updated).toLocaleDateString()}</div>
    </div>
  `).join('');
}

function stripHtml(h) { const d=document.createElement('div'); d.innerHTML=h||''; return d.textContent||''; }
function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

renderList();
