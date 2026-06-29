// ── Stopwatch ────────────────────────────────────────────────
let swRunning = false, swStart = 0, swElapsed = 0, swTimer = null;
let laps = [];
let mode = 'sw';

function pad(n,d=2){ return String(Math.floor(n)).padStart(d,'0'); }

function formatSW(ms) {
  const h   = Math.floor(ms/3600000);
  const m   = Math.floor((ms%3600000)/60000);
  const s   = Math.floor((ms%60000)/1000);
  const cs  = Math.floor((ms%1000)/10);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
}

function updateRing(ms) {
  // animate ring up to 60 seconds cycle
  const circ = 339.3;
  const frac = (ms % 60000) / 60000;
  const offset = circ - frac * circ;
  const ring = document.getElementById('swRing');
  ring.style.strokeDashoffset = offset;
  ring.classList.toggle('running', swRunning);
}

function tickSW() {
  const now = Date.now();
  swElapsed += now - swStart;
  swStart = now;
  document.getElementById('swDisplay').textContent = formatSW(swElapsed);
  document.getElementById('swLabel').textContent = swRunning ? 'Running…' : 'Paused';
  updateRing(swElapsed);
}

function toggleSW() {
  const btn = document.getElementById('swStart');
  if (!swRunning) {
    swRunning = true;
    swStart = Date.now();
    swTimer = setInterval(tickSW, 10);
    btn.textContent = '⏸ Pause';
    btn.classList.add('running');
    document.getElementById('swLabel').textContent = 'Running…';
  } else {
    swRunning = false;
    clearInterval(swTimer);
    btn.textContent = '▶ Resume';
    btn.classList.remove('running');
    document.getElementById('swLabel').textContent = 'Paused';
  }
}

function lapSW() {
  if (!swRunning && swElapsed === 0) return;
  const prev = laps.length ? laps[laps.length-1].total : 0;
  laps.push({ total: swElapsed, split: swElapsed - prev, num: laps.length + 1 });
  renderLaps();
  toast('Lap ' + laps.length + ' recorded!');
}

function resetSW() {
  swRunning = false;
  clearInterval(swTimer);
  swElapsed = 0;
  document.getElementById('swDisplay').textContent = '00:00:00.00';
  document.getElementById('swLabel').textContent = 'Ready';
  document.getElementById('swStart').textContent = '▶ Start';
  document.getElementById('swStart').classList.remove('running');
  updateRing(0);
}

function clearLaps() { laps = []; renderLaps(); }

function renderLaps() {
  const el = document.getElementById('lapsList');
  if (!laps.length) { el.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:20px">No laps recorded.</p>'; return; }
  const splits = laps.map(l => l.split);
  const best  = Math.min(...splits);
  const worst = Math.max(...splits);

  el.innerHTML = [...laps].reverse().map(l => {
    const cls = l.split === best && laps.length > 1 ? 'lap-best' : l.split === worst && laps.length > 1 ? 'lap-worst' : '';
    return `<div class="lap-item">
      <span class="lap-num">Lap ${l.num}</span>
      <span class="lap-time ${cls}">${formatSW(l.total)}</span>
      <span class="lap-diff">+${formatSW(l.split)}</span>
    </div>`;
  }).join('');
}

// ── Countdown ────────────────────────────────────────────────
let cdRunning = false, cdRemaining = 0, cdTimer2 = null;

function formatCD(ms) {
  const h = Math.floor(ms/3600000);
  const m = Math.floor((ms%3600000)/60000);
  const s = Math.floor((ms%60000)/1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function toggleCD() {
  if (!cdRunning) {
    if (!cdRemaining) {
      const h = parseInt(document.getElementById('cdHr').value)||0;
      const m = parseInt(document.getElementById('cdMin').value)||0;
      const s = parseInt(document.getElementById('cdSec').value)||0;
      cdRemaining = (h*3600+m*60+s)*1000;
      if (!cdRemaining) { toast('Set a time first!','warning'); return; }
    }
    cdRunning = true;
    const btn = document.getElementById('cdStart');
    btn.textContent = '⏸ Pause'; btn.classList.add('running');
    document.getElementById('cdLabel').textContent = 'Counting down…';
    cdTimer2 = setInterval(() => {
      cdRemaining -= 100;
      if (cdRemaining <= 0) {
        cdRemaining = 0;
        clearInterval(cdTimer2);
        cdRunning = false;
        document.getElementById('cdStart').textContent = '▶ Start';
        document.getElementById('cdStart').classList.remove('running');
        document.getElementById('cdLabel').textContent = '⏰ Time is up!';
        toast('⏰ Time is up!', 'success');
      }
      document.getElementById('cdDisplay').textContent = formatCD(cdRemaining);
    }, 100);
  } else {
    cdRunning = false;
    clearInterval(cdTimer2);
    document.getElementById('cdStart').textContent = '▶ Resume';
    document.getElementById('cdStart').classList.remove('running');
    document.getElementById('cdLabel').textContent = 'Paused';
  }
}

function resetCD() {
  cdRunning = false;
  clearInterval(cdTimer2);
  cdRemaining = 0;
  document.getElementById('cdDisplay').textContent = '00:00:00';
  document.getElementById('cdStart').textContent = '▶ Start';
  document.getElementById('cdStart').classList.remove('running');
  document.getElementById('cdLabel').textContent = 'Set time below';
}

// ── Mode Switch ──────────────────────────────────────────────
function switchMode(m, btn) {
  mode = m;
  document.querySelectorAll('.sw-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('swMode').style.display = m==='sw' ? 'block' : 'none';
  document.getElementById('cdMode').style.display = m==='cd' ? 'block' : 'none';
}
