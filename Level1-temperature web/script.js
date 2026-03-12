/**
 * ThermoConvert — Temperature Converter
 * Handles all conversion logic, input validation,
 * live preview, and result rendering.
 */

/* ===========================
   STATE
=========================== */
let selectedUnit = 'C'; // 'C' | 'F' | 'K'

/* ===========================
   DOM REFERENCES
=========================== */
const tempInput    = document.getElementById('tempInput');
const inputBadge   = document.getElementById('inputUnitBadge');
const unitSelector = document.getElementById('unitSelector');
const convertBtn   = document.getElementById('convertBtn');
const resetBtn     = document.getElementById('resetBtn');
const resultArea   = document.getElementById('resultArea');
const resultInner  = document.getElementById('resultInner');
const resultCards  = document.getElementById('resultCards');
const errorMsg     = document.getElementById('errorMsg');
const livePreview  = document.getElementById('livePreview');
const liveText     = document.getElementById('liveText');

/* ===========================
   UNIT BADGE MAP
=========================== */
const unitBadge = { C: '°C', F: '°F', K: 'K' };
const unitLabel = { C: 'Celsius', F: 'Fahrenheit', K: 'Kelvin' };

/* ===========================
   CONVERSION FUNCTIONS
=========================== */
/**
 * Convert any unit → Celsius first (normalise),
 * then Celsius → any target unit.
 */
function toCelsius(value, from) {
  switch (from) {
    case 'C': return value;
    case 'F': return (value - 32) * 5 / 9;
    case 'K': return value - 273.15;
  }
}

function fromCelsius(celsius, to) {
  switch (to) {
    case 'C': return celsius;
    case 'F': return celsius * 9 / 5 + 32;
    case 'K': return celsius + 273.15;
  }
}

function convert(value, from, to) {
  if (from === to) return value;
  const celsius = toCelsius(value, from);
  return fromCelsius(celsius, to);
}

/* ===========================
   FORMAT HELPERS
=========================== */
function fmt(num) {
  // Show up to 4 decimal places, trim trailing zeros
  return parseFloat(num.toFixed(4)).toString();
}

function symbol(unit) {
  return unit === 'K' ? 'K' : (unit === 'C' ? '°C' : '°F');
}

function valueColor(unit) {
  if (unit === 'C') return 'result-card__value--celsius';
  if (unit === 'F') return 'result-card__value--fahrenheit';
  return 'result-card__value--kelvin';
}

/* ===========================
   VALIDATION
=========================== */
function validateInput(raw) {
  if (raw.trim() === '') {
    return { valid: false, message: 'Please enter a temperature value.' };
  }
  const num = parseFloat(raw);
  if (isNaN(num)) {
    return { valid: false, message: 'Invalid input — please enter a number.' };
  }
  // Absolute zero check
  const celsius = toCelsius(num, selectedUnit);
  if (celsius < -273.15) {
    return { valid: false, message: 'Temperature below absolute zero (−273.15 °C) is impossible.' };
  }
  return { valid: true, value: num };
}

/* ===========================
   ERROR DISPLAY
=========================== */
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add('visible');
  tempInput.classList.add('input--error');
}

function clearError() {
  errorMsg.textContent = '';
  errorMsg.classList.remove('visible');
  tempInput.classList.remove('input--error');
}

/* ===========================
   RENDER RESULTS
=========================== */
function renderResults(value) {
  const units = ['C', 'F', 'K'];
  const allValues = {};
  units.forEach(u => { allValues[u] = convert(value, selectedUnit, u); });

  // Main result area — show all three nicely
  resultInner.innerHTML = `
    <div class="result-text">
      <strong>${fmt(value)}${symbol(selectedUnit)}</strong> equals
    </div>
  `;
  resultArea.classList.add('has-result');

  // Result cards — the two OTHER units
  const others = units.filter(u => u !== selectedUnit);
  resultCards.innerHTML = others.map(u => `
    <div class="result-card">
      <span class="result-card__label">${unitLabel[u]}</span>
      <span class="result-card__value ${valueColor(u)}">${fmt(allValues[u])}${symbol(u)}</span>
    </div>
  `).join('');
}

/* ===========================
   CONVERT HANDLER
=========================== */
function handleConvert() {
  clearError();
  const raw = tempInput.value;
  const check = validateInput(raw);

  if (!check.valid) {
    showError(check.message);
    resultArea.classList.remove('has-result');
    resultInner.innerHTML = '<p class="result-area__hint">Enter a value and hit Convert</p>';
    resultCards.innerHTML = '';
    return;
  }

  renderResults(check.value);
}

/* ===========================
   RESET HANDLER
=========================== */
function handleReset() {
  tempInput.value = '';
  clearError();
  resultArea.classList.remove('has-result');
  resultInner.innerHTML = '<p class="result-area__hint">Enter a value and hit Convert</p>';
  resultCards.innerHTML = '';
  livePreview.classList.remove('active');
  liveText.textContent = 'Live preview will appear here…';
  tempInput.focus();
}

/* ===========================
   UNIT BUTTON HANDLER
=========================== */
unitSelector.addEventListener('click', (e) => {
  const btn = e.target.closest('.unit-btn');
  if (!btn) return;

  document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  selectedUnit = btn.dataset.unit;
  inputBadge.textContent = unitBadge[selectedUnit];

  // Re-run live preview with new unit
  updateLivePreview();
});

/* ===========================
   LIVE PREVIEW (on input)
=========================== */
function updateLivePreview() {
  const raw = tempInput.value;
  if (raw.trim() === '') {
    livePreview.classList.remove('active');
    liveText.textContent = 'Live preview will appear here…';
    return;
  }

  const num = parseFloat(raw);
  if (isNaN(num)) {
    livePreview.classList.remove('active');
    liveText.textContent = 'Waiting for valid input…';
    return;
  }

  const celsius = toCelsius(num, selectedUnit);
  if (celsius < -273.15) {
    livePreview.classList.remove('active');
    liveText.textContent = 'Below absolute zero!';
    return;
  }

  const units = ['C', 'F', 'K'].filter(u => u !== selectedUnit);
  const parts = units.map(u => `${fmt(convert(num, selectedUnit, u))}${symbol(u)}`).join('  ·  ');
  liveText.textContent = `${fmt(num)}${symbol(selectedUnit)}  →  ${parts}`;
  livePreview.classList.add('active');
}

tempInput.addEventListener('input', updateLivePreview);

/* ===========================
   KEYBOARD SUPPORT
=========================== */
tempInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleConvert();
  if (e.key === 'Escape') handleReset();
});

/* ===========================
   BUTTON LISTENERS
=========================== */
convertBtn.addEventListener('click', handleConvert);
resetBtn.addEventListener('click', handleReset);

/* ===========================
   INIT
=========================== */
tempInput.focus();
