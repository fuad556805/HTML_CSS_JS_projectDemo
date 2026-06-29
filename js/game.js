var SCORE_KEY = 'sh_guess_score';

var secret    = 0;
var maxRange  = 50;
var attempts  = 0;
var gameActive = false;
var hintLow   = 1;
var hintHigh  = 50;

var score = JSON.parse(localStorage.getItem(SCORE_KEY) || '{"wins":0,"losses":0,"best":null}');

function setRange(n, btn) {
  maxRange = n;
  document.getElementById('rangeMax').textContent = n;
  document.getElementById('guessInput').max = n;
  document.querySelectorAll('.range-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  startGame();
}

function startGame() {
  secret    = Math.floor(Math.random() * maxRange) + 1;
  attempts  = 0;
  gameActive = true;
  hintLow   = 1;
  hintHigh  = maxRange;

  document.getElementById('guessInput').value = '';
  document.getElementById('guessInput').disabled = false;
  document.getElementById('attemptsCount').textContent = 0;
  document.getElementById('historyChips').innerHTML = '';
  document.getElementById('hintRange').textContent = '';

  setFeedback('🎯', 'Make your first guess!', '');
  document.getElementById('targetInfo').innerHTML =
    'Guess a number between <strong>1</strong> and <strong>' + maxRange + '</strong>';
  document.getElementById('guessInput').focus();
}

function submitGuess() {
  if (!gameActive) { startGame(); return; }

  var input = document.getElementById('guessInput');
  var val   = parseInt(input.value, 10);

  if (!val || val < 1 || val > maxRange) {
    toast('Enter a number between 1 and ' + maxRange, 'warning');
    return;
  }

  attempts++;
  document.getElementById('attemptsCount').textContent = attempts;
  input.value = '';
  input.focus();

  if (val === secret) {
    // WIN
    score.wins++;
    if (score.best === null || attempts < score.best) score.best = attempts;
    saveScore();
    gameActive = false;
    input.disabled = true;
    addChip(val, 'chip-win');
    setFeedback('🎉', 'Correct! It was ' + secret + '! You got it in ' + attempts + ' attempt' + (attempts === 1 ? '' : 's') + '.', 'win');
    document.getElementById('hintRange').textContent = '';
    toast('You won! 🏆', 'success');

  } else if (val > secret) {
    // TOO HIGH
    hintHigh = Math.min(hintHigh, val - 1);
    addChip(val, 'chip-high');
    setFeedback('📈', 'Too High! Try a lower number.', 'high');
    document.getElementById('hintRange').textContent = 'Try between ' + hintLow + ' – ' + hintHigh;

  } else {
    // TOO LOW
    hintLow = Math.max(hintLow, val + 1);
    addChip(val, 'chip-low');
    setFeedback('📉', 'Too Low! Try a higher number.', 'low');
    document.getElementById('hintRange').textContent = 'Try between ' + hintLow + ' – ' + hintHigh;
  }

  updateScoreDisplay();
}

function setFeedback(icon, msg, cls) {
  var box  = document.getElementById('feedbackBox');
  box.className = 'feedback-box' + (cls ? ' ' + cls : '');
  document.getElementById('feedbackIcon').textContent = icon;
  document.getElementById('feedbackMsg').textContent  = msg;
}

function addChip(val, cls) {
  var chip = document.createElement('span');
  chip.className = 'chip ' + cls;
  chip.textContent = val;
  document.getElementById('historyChips').appendChild(chip);
}

function saveScore() {
  localStorage.setItem(SCORE_KEY, JSON.stringify(score));
  localStorage.setItem('sh_guess_wins', score.wins);
}

function updateScoreDisplay() {
  document.getElementById('scoreWins').textContent   = score.wins;
  document.getElementById('scoreLosses').textContent = score.losses;
  document.getElementById('scoreBest').textContent   = score.best !== null ? score.best : '–';
}

function clearScore() {
  score = { wins: 0, losses: 0, best: null };
  saveScore();
  updateScoreDisplay();
  toast('Score reset!');
}

// Enter key support
document.getElementById('guessInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') submitGuess();
});

// Init
startGame();
updateScoreDisplay();
