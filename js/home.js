var NAME_KEY = 'sh_name';

function getName() { return localStorage.getItem(NAME_KEY) || ''; }

function saveName() {
  var val = document.getElementById('nameInput').value.trim();
  if (!val) { toast('Please enter your name!', 'warning'); return; }
  localStorage.setItem(NAME_KEY, val);
  document.getElementById('nameModal').classList.add('hidden');
  applyName(val);
  toast('Welcome, ' + val + '! 🎉', 'success');
}

function applyName(name) {
  var h = new Date().getHours();
  var g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greetMsg').textContent = g + (name ? ', ' + name : '') + '! 👋';
}

function editName() {
  var name = prompt('Enter your name:', getName());
  if (name && name.trim()) {
    localStorage.setItem(NAME_KEY, name.trim());
    applyName(name.trim());
    toast('Name updated!', 'success');
  }
}

function tickClock() {
  var now = new Date();
  document.getElementById('liveTime').textContent =
    now.toLocaleTimeString('en-US', { hour12: false });
  document.getElementById('liveDate').textContent =
    now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function loadStats() {
  var todos  = JSON.parse(localStorage.getItem('sh_todos')  || '[]');
  var notes  = JSON.parse(localStorage.getItem('sh_notes')  || '[]');
  var events = JSON.parse(localStorage.getItem('sh_events') || '[]');
  var today  = new Date().toISOString().split('T')[0];

  document.getElementById('statTodo').textContent   = todos.filter(function(t) { return !t.done; }).length;
  document.getElementById('statNotes').textContent  = notes.length;
  document.getElementById('statEvents').textContent = events.filter(function(e) { return e.date === today; }).length;
  document.getElementById('statScore').textContent  = localStorage.getItem('sh_guess_wins') || 0;
}

// Enter key on name modal
document.getElementById('nameInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') saveName();
});

// Init
(function() {
  var name = getName();
  if (!name) {
    document.getElementById('nameModal').classList.remove('hidden');
  } else {
    document.getElementById('nameModal').classList.add('hidden');
    applyName(name);
  }
  tickClock();
  setInterval(tickClock, 1000);
  loadStats();
})();
