const EV_KEY = 'sh_events';
let currentDate = new Date();
let selectedDate = null;
let modalEvId = null;

function getEvents() { return JSON.parse(localStorage.getItem(EV_KEY) || '[]'); }
function saveEvents(e){ localStorage.setItem(EV_KEY, JSON.stringify(e)); }

function fmt(d) {
  return d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

function isoDate(y,m,d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function renderCalendar() {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  document.getElementById('calTitle').textContent =
    new Date(y, m, 1).toLocaleDateString('en-US', { month:'long', year:'numeric' });

  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const daysInPrev  = new Date(y, m, 0).getDate();
  const today = new Date();
  const events = getEvents();

  const container = document.getElementById('calDays');
  container.innerHTML = '';

  // Prev month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const cell = dayCell(new Date(y, m-1, d), d, true, events);
    container.appendChild(cell);
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d);
    const isToday = date.toDateString() === today.toDateString();
    const cell = dayCell(date, d, false, events, isToday);
    container.appendChild(cell);
  }

  // Next month fill
  const total = firstDay + daysInMonth;
  const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= rem; d++) {
    container.appendChild(dayCell(new Date(y, m+1, d), d, true, events));
  }
}

function dayCell(date, num, otherMonth, events, isToday) {
  const div = document.createElement('div');
  div.className = 'cal-day' + (otherMonth?' other-month':'') + (isToday?' today':'');
  const dateStr = isoDate(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEvs  = events.filter(e => e.date === dateStr);

  const selStr  = selectedDate ? isoDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) : '';
  if (dateStr === selStr && !isToday) div.classList.add('selected');

  div.innerHTML = `<div class="day-num">${num}</div>
    <div class="day-dots">${dayEvs.slice(0,3).map(e=>`<div class="day-dot" style="background:${e.color||'var(--primary)'}"></div>`).join('')}</div>`;

  div.addEventListener('click', () => {
    selectedDate = date;
    document.getElementById('evDate').value = dateStr;
    renderCalendar();
    renderEvents(dateStr);
    document.getElementById('evListTitle').textContent = 'Events – ' + date.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  });
  return div;
}

function addEvent() {
  const title = document.getElementById('evTitle').value.trim();
  const date  = document.getElementById('evDate').value;
  const time  = document.getElementById('evTime').value;
  const color = document.getElementById('evColor').value;
  if (!title) { toast('Enter event title!', 'warning'); return; }
  if (!date)  { toast('Pick a date!', 'warning'); return; }
  const events = getEvents();
  events.push({ id: Date.now(), title, date, time, color });
  saveEvents(events);
  document.getElementById('evTitle').value = '';
  renderCalendar();
  renderEvents(date);
  toast('Event added! 📅', 'success');
}

function renderEvents(dateStr) {
  const events = getEvents().filter(e => e.date === dateStr)
    .sort((a,b) => (a.time||'').localeCompare(b.time||''));
  const list = document.getElementById('eventList');
  if (!events.length) {
    list.innerHTML = '<p class="no-events">No events for this day.</p>';
    return;
  }
  list.innerHTML = events.map(e => `
    <div class="event-item" style="border-left-color:${e.color||'var(--primary)'}" onclick="openModal(${e.id})">
      <div class="event-dot" style="background:${e.color||'var(--primary)'}"></div>
      <div class="event-info">
        <div class="event-title">${escHtml(e.title)}</div>
        <div class="event-date">${e.time ? '🕐 ' + e.time : '📅 All day'}</div>
      </div>
    </div>
  `).join('');
}

function showAll() {
  const events = getEvents().sort((a,b) => a.date.localeCompare(b.date));
  const list = document.getElementById('eventList');
  document.getElementById('evListTitle').textContent = 'All Events';
  if (!events.length) { list.innerHTML = '<p class="no-events">No events yet.</p>'; return; }
  list.innerHTML = events.map(e => `
    <div class="event-item" style="border-left-color:${e.color||'var(--primary)'}" onclick="openModal(${e.id})">
      <div class="event-dot" style="background:${e.color||'var(--primary)'}"></div>
      <div class="event-info">
        <div class="event-title">${escHtml(e.title)}</div>
        <div class="event-date">📅 ${e.date}${e.time ? ' 🕐 ' + e.time : ''}</div>
      </div>
    </div>
  `).join('');
}

function openModal(id) {
  const ev = getEvents().find(e => e.id === id);
  if (!ev) return;
  modalEvId = id;
  document.getElementById('evModalTitle').textContent = ev.title;
  document.getElementById('evModalDate').textContent  = ev.date + (ev.time ? ' at ' + ev.time : '');
  document.getElementById('evModal').classList.remove('hidden');
}

function closeModal() { document.getElementById('evModal').classList.add('hidden'); modalEvId = null; }

function deleteEvent() {
  if (!modalEvId) return;
  saveEvents(getEvents().filter(e => e.id !== modalEvId));
  closeModal();
  renderCalendar();
  showAll();
  toast('Event deleted', 'danger');
}

function changeMonth(d) { currentDate.setMonth(currentDate.getMonth() + d); renderCalendar(); }
function goToday() { currentDate = new Date(); selectedDate = null; renderCalendar(); showAll(); }

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Set today's date in input
document.getElementById('evDate').value = new Date().toISOString().split('T')[0];

renderCalendar();
showAll();
