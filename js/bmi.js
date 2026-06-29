let unit = 'metric';

function setUnit(u, btn) {
  unit = u;
  document.querySelectorAll('.utab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('metricInputs').style.display   = u === 'metric'   ? 'block' : 'none';
  document.getElementById('imperialInputs').style.display = u === 'imperial' ? 'block' : 'none';
}

function calcBMI() {
  let heightM, weightKg;

  if (unit === 'metric') {
    const h = parseFloat(document.getElementById('heightCm').value);
    const w = parseFloat(document.getElementById('weightKg').value);
    if (!h || !w) { toast('Please enter height and weight!', 'warning'); return; }
    heightM = h / 100;
    weightKg = w;
  } else {
    const ft  = parseFloat(document.getElementById('heightFt').value) || 0;
    const ins = parseFloat(document.getElementById('heightIn').value) || 0;
    const lb  = parseFloat(document.getElementById('weightLb').value);
    if (!lb || (!ft && !ins)) { toast('Please enter height and weight!', 'warning'); return; }
    heightM  = (ft * 12 + ins) * 0.0254;
    weightKg = lb * 0.453592;
  }

  const age    = parseInt(document.getElementById('ageInput').value) || 0;
  const gender = document.getElementById('genderInput').value;

  if (heightM <= 0 || weightKg <= 0) { toast('Invalid values!', 'danger'); return; }

  const bmi  = weightKg / (heightM * heightM);
  const bmiR = +bmi.toFixed(1);

  let cat, emoji, color, tips;
  if      (bmiR < 18.5) { cat='Underweight'; emoji='🥗'; color='#118ab2'; tips=tipsUnder; }
  else if (bmiR < 25)   { cat='Normal Weight'; emoji='✅'; color='#06d6a0'; tips=tipsNormal; }
  else if (bmiR < 30)   { cat='Overweight'; emoji='⚠️'; color='#ffd166'; tips=tipsOver; }
  else if (bmiR < 35)   { cat='Obese (Class I)'; emoji='🔴'; color='#ef476f'; tips=tipsObese; }
  else if (bmiR < 40)   { cat='Obese (Class II)'; emoji='🔴'; color='#d00040'; tips=tipsObese; }
  else                  { cat='Obese (Class III)'; emoji='🔴'; color='#900'; tips=tipsObese; }

  // Ideal weight range (BMI 18.5–24.9)
  const idealMin = +(18.5 * heightM * heightM).toFixed(1);
  const idealMax = +(24.9 * heightM * heightM).toFixed(1);

  // BMR (Mifflin-St Jeor)
  let bmr = 0;
  if (age && gender) {
    bmr = gender === 'male'
      ? 10 * weightKg + 6.25 * heightM * 100 - 5 * age + 5
      : 10 * weightKg + 6.25 * heightM * 100 - 5 * age - 161;
  }

  // Gauge needle (BMI range: 10–45)
  const pct = Math.min(Math.max((bmiR - 10) / (45 - 10), 0), 1) * 100;

  document.getElementById('bmiResult').style.display = 'block';
  document.getElementById('bmiNum').textContent = bmiR;
  document.getElementById('bmiCat').textContent  = cat;
  document.getElementById('bmiCat').style.color  = color;
  document.getElementById('bmiEmoji').textContent = emoji;
  document.getElementById('gaugeNeedle').style.left = pct + '%';

  document.getElementById('bmiInfoGrid').innerHTML = `
    <div class="bmi-info-item"><div class="bmi-info-label">BMI Value</div><div class="bmi-info-value">${bmiR}</div></div>
    <div class="bmi-info-item"><div class="bmi-info-label">Category</div><div class="bmi-info-value" style="font-size:.9rem">${cat}</div></div>
    <div class="bmi-info-item"><div class="bmi-info-label">Ideal Weight</div><div class="bmi-info-value">${idealMin}–${idealMax} kg</div></div>
    ${bmr ? `<div class="bmi-info-item"><div class="bmi-info-label">BMR (kcal/day)</div><div class="bmi-info-value">${Math.round(bmr)}</div></div>` : ''}
    <div class="bmi-info-item"><div class="bmi-info-label">Weight to lose</div><div class="bmi-info-value">${weightKg > idealMax ? (weightKg - idealMax).toFixed(1) + ' kg' : 'On track!'}</div></div>
    <div class="bmi-info-item"><div class="bmi-info-label">Weight to gain</div><div class="bmi-info-value">${weightKg < idealMin ? (idealMin - weightKg).toFixed(1) + ' kg' : 'On track!'}</div></div>
  `;

  document.getElementById('healthTips').innerHTML = `
    <h4>💡 Health Tips</h4>
    <ul>${tips.map(t => '<li>' + t + '</li>').join('')}</ul>
  `;

  toast('BMI calculated! ' + emoji, 'success');
}

const tipsUnder  = ['Increase calorie intake with nutritious foods.','Eat more proteins and healthy fats.','Consult a dietitian for a personalized plan.'];
const tipsNormal = ['Keep up your healthy habits!','Maintain balanced diet and regular exercise.','Stay hydrated and get enough sleep.'];
const tipsOver   = ['Reduce portion sizes gradually.','Include 150+ minutes of exercise per week.','Limit processed foods and sugary drinks.'];
const tipsObese  = ['Consult a healthcare professional.','Set small, achievable weight loss goals.','Focus on sustainable lifestyle changes.'];
