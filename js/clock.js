let fmt = 24;

const worldZones = [
  { city:'New York',      tz:'America/New_York',      flag:'🇺🇸' },
  { city:'London',        tz:'Europe/London',          flag:'🇬🇧' },
  { city:'Paris',         tz:'Europe/Paris',           flag:'🇫🇷' },
  { city:'Dubai',         tz:'Asia/Dubai',             flag:'🇦🇪' },
  { city:'Dhaka',         tz:'Asia/Dhaka',             flag:'🇧🇩' },
  { city:'Tokyo',         tz:'Asia/Tokyo',             flag:'🇯🇵' },
  { city:'Sydney',        tz:'Australia/Sydney',       flag:'🇦🇺' },
  { city:'Los Angeles',   tz:'America/Los_Angeles',    flag:'🇺🇸' },
];

function setFmt(f, btn) {
  fmt = f;
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function tick() {
  const now = new Date();

  // Analog
  const s = now.getSeconds();
  const m = now.getMinutes();
  const h = now.getHours() % 12;

  const secDeg  = s * 6;
  const minDeg  = m * 6 + s * 0.1;
  const hourDeg = h * 30 + m * 0.5;

  document.getElementById('secHand').style.transform  = `rotate(${secDeg}deg)`;
  document.getElementById('minHand').style.transform  = `rotate(${minDeg}deg)`;
  document.getElementById('hourHand').style.transform = `rotate(${hourDeg}deg)`;

  // Digital main
  const timeStr = fmt === 24
    ? now.toLocaleTimeString('en-GB', { hour12:false })
    : now.toLocaleTimeString('en-US', { hour12:true });

  document.getElementById('mainTime').textContent = timeStr;
  document.getElementById('mainDate').textContent =
    now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  document.getElementById('mainTz').textContent = tz;

  // World clocks
  const grid = document.getElementById('worldGrid');
  grid.innerHTML = worldZones.map(z => {
    const t = new Date().toLocaleTimeString('en-US', { timeZone: z.tz, hour12: fmt===12 });
    const d = new Date().toLocaleDateString('en-US', { timeZone: z.tz, weekday:'short', month:'short', day:'numeric' });
    const off = getOffset(z.tz);
    return `<div class="world-card">
      <div class="world-city">${z.flag} ${z.city}</div>
      <div class="world-time">${t}</div>
      <div class="world-date">${d}</div>
      <div class="world-tz">UTC${off}</div>
    </div>`;
  }).join('');
}

function getOffset(tz) {
  try {
    const d = new Date();
    const local = new Date(d.toLocaleString('en-US', { timeZone: tz }));
    const diff  = Math.round((local - d) / 60000);
    const h = Math.floor(Math.abs(diff)/60);
    const m = Math.abs(diff) % 60;
    return (diff>=0?'+':'-') + String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
  } catch { return ''; }
}

tick();
setInterval(tick, 1000);
