const categories = {
  Length: {
    icon:'📏', units:{
      Meter:1, Kilometer:1000, Centimeter:.01, Millimeter:.001,
      Inch:.0254, Foot:.3048, Yard:.9144, Mile:1609.344,
      'Nautical Mile':1852
    }
  },
  Weight: {
    icon:'⚖️', units:{
      Kilogram:1, Gram:.001, Milligram:.000001, Pound:.453592,
      Ounce:.0283495, Tonne:1000, Stone:6.35029
    }
  },
  Temperature: {
    icon:'🌡️', special:true, units:['Celsius','Fahrenheit','Kelvin']
  },
  Speed: {
    icon:'💨', units:{
      'm/s':1, 'km/h':1/3.6, 'mph':0.44704, 'knot':0.514444, 'ft/s':0.3048
    }
  },
  Area: {
    icon:'🔲', units:{
      'm²':1, 'km²':1e6, 'cm²':0.0001, 'ft²':0.092903,
      'in²':0.00064516, Acre:4046.86, Hectare:10000
    }
  },
  Volume: {
    icon:'🧊', units:{
      Liter:1, Milliliter:.001, 'Cubic Meter':1000, Gallon:3.78541,
      Pint:0.473176, Cup:0.236588, Tablespoon:0.0147868, Teaspoon:0.00492892
    }
  },
  Time: {
    icon:'⏰', units:{
      Second:1, Minute:60, Hour:3600, Day:86400,
      Week:604800, Month:2629800, Year:31557600
    }
  },
  Data: {
    icon:'💾', units:{
      Bit:1, Byte:8, Kilobyte:8192, Megabyte:8388608,
      Gigabyte:8589934592, Terabyte:8796093022208
    }
  },
  Energy: {
    icon:'⚡', units:{
      Joule:1, Kilojoule:1000, Calorie:4.184, Kilocalorie:4184,
      'Watt-hour':3600, 'kWh':3600000
    }
  }
};

let activeCat = 'Length';

function initCats() {
  const pills = document.getElementById('catPills');
  pills.innerHTML = Object.keys(categories).map(c =>
    `<button class="cat-pill ${c===activeCat?'active':''}" onclick="setCat('${c}',this)">${categories[c].icon} ${c}</button>`
  ).join('');
}

function setCat(c, btn) {
  activeCat = c;
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  populateUnits();
  convert();
  renderTable();
}

function populateUnits() {
  const cat = categories[activeCat];
  const from = document.getElementById('fromUnit');
  const to   = document.getElementById('toUnit');
  const units = cat.special ? cat.units : Object.keys(cat.units);

  from.innerHTML = to.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
  if (units.length > 1) to.selectedIndex = 1;
}

function convertTemp(val, from, to) {
  // Convert to Celsius first
  let c;
  if (from === 'Celsius')    c = val;
  else if (from === 'Fahrenheit') c = (val - 32) * 5/9;
  else c = val - 273.15;
  // Then to target
  if (to === 'Celsius')    return +c.toFixed(6);
  if (to === 'Fahrenheit') return +(c * 9/5 + 32).toFixed(6);
  return +(c + 273.15).toFixed(6);
}

function convert() {
  const valStr = document.getElementById('fromVal').value;
  const val    = parseFloat(valStr);
  const from   = document.getElementById('fromUnit').value;
  const to     = document.getElementById('toUnit').value;
  const outEl  = document.getElementById('toVal');
  const fmlEl  = document.getElementById('convFormula');

  if (isNaN(val)) { outEl.value = ''; fmlEl.textContent = ''; return; }
  if (from === to) { outEl.value = val; fmlEl.textContent = '1 ' + from + ' = 1 ' + to; return; }

  const cat = categories[activeCat];
  let result;

  if (cat.special) {
    result = convertTemp(val, from, to);
    fmlEl.textContent = `${val} ${from} → ${result} ${to}`;
  } else {
    const toBase = val * cat.units[from];
    result = +(toBase / cat.units[to]).toFixed(8);
    const rate = +(cat.units[from] / cat.units[to]).toFixed(8);
    fmlEl.textContent = `1 ${from} = ${rate} ${to}`;
  }

  outEl.value = result;
}

function swapUnits() {
  const fromSel = document.getElementById('fromUnit');
  const toSel   = document.getElementById('toUnit');
  const fromVal = document.getElementById('fromVal');
  const toVal   = document.getElementById('toVal');

  const tmpU = fromSel.value;
  fromSel.value = toSel.value;
  toSel.value   = tmpU;
  fromVal.value = toVal.value;
  convert();
}

function renderTable() {
  const cat = categories[activeCat];
  const title = document.getElementById('tableTitle');
  const table = document.getElementById('convTable');
  title.textContent = categories[activeCat].icon + ' Common ' + activeCat + ' Conversions';

  if (cat.special) {
    table.innerHTML = `<div class="conv-table-grid">
      ${[[0,'Celsius','Fahrenheit'],[100,'Celsius','Fahrenheit'],[37,'Celsius','Fahrenheit'],
         [0,'Celsius','Kelvin'],[100,'Celsius','Kelvin'],[-40,'Celsius','Fahrenheit']].map(([v,f,t]) => {
        const r = convertTemp(v,f,t);
        return `<div class="conv-ref-item"><div class="conv-ref-from">${v} ${f}</div><div class="conv-ref-to">= ${r} ${t}</div></div>`;
      }).join('')}
    </div>`;
    return;
  }

  const units = Object.keys(cat.units);
  const base  = units[0];
  const rows  = units.slice(1).map(u => {
    const r = +(cat.units[base] / cat.units[u]).toFixed(8);
    return `<div class="conv-ref-item"><div class="conv-ref-from">1 ${base}</div><div class="conv-ref-to">= ${r} ${u}</div></div>`;
  });

  table.innerHTML = `<div class="conv-table-grid">${rows.join('')}</div>`;
}

initCats();
populateUnits();
renderTable();
