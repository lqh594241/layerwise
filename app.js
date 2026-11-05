(function () {
'use strict';

const { DEFAULTS, LIMITS, normalize, calculate } = globalThis.LayerwiseCalculator;

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'layerwise.estimate.v1';
const costLabels = { material: 'Material', electricity: 'Electricity', machine: 'Machine time', labor: 'Hands-on labor', other: 'Other costs' };
const costColors = { material: '#c3e68e', electricity: '#a2b58b', machine: '#6f8764', labor: '#dee7c7', other: '#44583e' };
const presets = {
  fdm: [{ id: 'pla', label: 'PLA', price: 22 }, { id: 'petg', label: 'PETG', price: 25 }, { id: 'abs', label: 'ABS', price: 24 }, { id: 'custom', label: 'Custom', price: null }],
  resin: [{ id: 'standard', label: 'Standard', price: 35 }, { id: 'tough', label: 'Tough', price: 50 }, { id: 'water', label: 'Water-washable', price: 40 }, { id: 'custom', label: 'Custom', price: null }]
};
const modeKeys = ['weight', 'materialPrice', 'hours', 'minutes', 'power', 'material'];
const modeDrafts = {
  fdm: { weight: 85, materialPrice: 22, hours: 4, minutes: 30, power: 120, material: 'pla' },
  resin: { weight: 45, materialPrice: 35, hours: 2, minutes: 30, power: 60, material: 'standard' }
};
let state = { ...DEFAULTS };
let result;
let storageAvailable = true;
let toastTimeout;

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) state = normalize(JSON.parse(saved));
} catch { storageAvailable = false; }

let sharedLoaded = false;
try {
  if (location.hash.length < 12000) {
    const shared = new URLSearchParams(location.hash.slice(1)).get('estimate');
    if (shared) {
      state = normalize(JSON.parse(shared));
      sharedLoaded = true;
    }
  }
} catch { /* A malformed link never prevents the default calculator loading. */ }

const money = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: state.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
const symbol = () => ({ USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$' })[state.currency];
const number = (amount, digits = 1) => new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(amount);

function toast(message) {
  clearTimeout(toastTimeout);
  $('toast').textContent = message;
  $('toast').hidden = false;
  toastTimeout = setTimeout(() => { $('toast').hidden = true; }, 4200);
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageAvailable = true;
  } catch { storageAvailable = false; }
  $('save-status').textContent = storageAvailable ? 'Automatically saved on this device' : 'Local saving unavailable · calculator still works';
}

function fillInputs() {
  for (const key of [...Object.keys(LIMITS), 'currency', 'pricing', 'job']) {
    if ($(key)) $(key).value = state[key];
  }
  renderMode();
}

function renderMode() {
  const resin = state.mode === 'resin';
  for (const button of document.querySelectorAll('[data-mode]')) {
    const selected = button.dataset.mode === state.mode;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  $('weight-label').textContent = resin ? 'Resin used' : 'Filament used';
  $('weight-unit').textContent = resin ? 'mL' : 'g';
  $('material-price-label').textContent = resin ? 'Resin price' : 'Filament price';
  $('price-unit').textContent = resin ? '/ liter' : '/ kg';
  $('material-presets').replaceChildren(...presets[state.mode].map((preset) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `material-preset${preset.id === state.material ? ' active' : ''}`;
    button.setAttribute('aria-pressed', String(preset.id === state.material));
    button.dataset.preset = preset.id;
    const dot = document.createElement('span');
    dot.className = 'preset-dot';
    dot.setAttribute('aria-hidden', 'true');
    button.append(dot, document.createTextNode(preset.label));
    return button;
  }));
}

function inputError() {
  for (const key of Object.keys(LIMITS)) {
    const input = $(key);
    const valid = input.value !== '' && input.validity.valid;
    input.setAttribute('aria-invalid', String(!valid));
    if (!valid) {
      const name = input.labels?.[0]?.textContent?.trim() || input.getAttribute('aria-label') || key;
      return `Check ${name.toLowerCase()}: enter a number from ${input.min} to ${input.max}${input.step === '1' ? ' (whole numbers only)' : ''}.`;
    }
  }
  return null;
}

function render() {
  const invalid = inputError();
  result = calculate(state);
  const error = invalid || (!result.valid ? result.error : '');
  $('input-error').hidden = !error;
  $('input-error').textContent = error || '';
  for (const id of ['quote-button', 'copy-button', 'share-button']) $(id).disabled = Boolean(error);
  $('total-cost').textContent = money(result.totalCost);
  $('suggested-price').textContent = error ? '—' : money(result.price);
  $('unit-profit').textContent = error ? '—' : money(result.profit);
  $('batch-total').textContent = error ? '—' : money(result.batchPrice);
  $('batch-count').textContent = `${number(state.quantity, 0)} ${state.quantity === 1 ? 'part' : 'parts'}`;
  $('failure-note').textContent = state.failure > 0
    ? `Includes ${money(result.failureAllowance || 0)} for failed print resources.`
    : 'No allowance for failed prints. Adjust if needed.';

  const segments = [];
  let position = 0;
  const legend = [];
  for (const [key, amount] of Object.entries(result.costs)) {
    const end = position + (result.totalCost > 0 ? amount / result.totalCost * 100 : 0);
    segments.push(`${costColors[key]} ${position}% ${end}%`);
    position = end;
    const row = document.createElement('div');
    row.className = 'legend-row';
    const dot = document.createElement('span');
    dot.className = 'legend-dot';
    dot.style.background = costColors[key];
    dot.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = costLabels[key];
    const value = document.createElement('strong');
    value.textContent = money(amount);
    row.append(dot, label, value);
    legend.push(row);
  }
  $('cost-legend').replaceChildren(...legend);
  $('cost-donut').style.background = result.totalCost > 0 ? `conic-gradient(${segments.join(',')})` : '#3c5034';
  $('cost-donut').setAttribute('aria-label', Object.entries(result.costs).map(([key, value]) => `${costLabels[key]}: ${money(value)}`).join('; '));
  document.querySelectorAll('.currency-symbol').forEach((item) => { item.textContent = symbol(); });
  $('target-slider').value = Math.min(80, state.target);
  const percentage = Math.min(100, state.target / 80 * 100);
  $('target-slider').style.background = `linear-gradient(to right,#bedf86 ${percentage}%,#40523a ${percentage}%)`;
  $('pricing-hint').textContent = state.pricing === 'margin'
    ? `Margin, not markup. Target: ${number(state.target)}% after fees.`
    : `Markup adds ${number(state.target)}% of cost, after fees.`;
  if ($('quote-dialog').open && !error) renderQuote();
}

function updateFromInputs(event) {
  const input = event.target;
  if (input.id === 'target-slider') $('target').value = input.value;
  const key = input.id === 'target-slider' ? 'target' : input.id;
  if (Object.hasOwn(LIMITS, key)) {
    // Keep the last valid number while a person types. Invalid fields block
    // quotes instead of silently creating a different quote from that value.
    const candidate = Number(input.value);
    if (input.value !== '' && Number.isFinite(candidate) && input.validity.valid) state[key] = candidate;
  } else if (key === 'currency' || key === 'pricing' || key === 'job') {
    state[key] = input.value;
  } else { return; }
  if (key === 'materialPrice') {
    state.material = 'custom';
    renderMode();
  }
  save();
  render();
}

function quoteDetails() {
  const materialName = presets[state.mode].find((p) => p.id === state.material)?.label || 'Custom';
  return {
    name: state.job.trim() || '3D printing project',
    technology: state.mode === 'resin' ? 'Resin / SLA' : 'FDM / Filament',
    material: materialName,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    description: `${number(state.weight)} ${state.mode === 'resin' ? 'mL' : 'g'} per part · ${state.hours} hr ${state.minutes} min per part`
  };
}

function quoteLine(label, value, className = 'quote-line') {
  const row = document.createElement('div');
  row.className = className;
  const name = document.createElement('span');
  name.textContent = label;
  const amount = document.createElement('strong');
  amount.textContent = value;
  row.append(name, amount);
  return row;
}

function quoteContent() {
  const q = quoteDetails();
  const fragment = document.createDocumentFragment();
  const name = document.createElement('h3');
  name.className = 'quote-project';
  name.textContent = q.name;
  const meta = document.createElement('div');
  meta.className = 'quote-meta';
  meta.textContent = `${q.technology} · ${q.material} · ${q.date}`;
  fragment.append(name, meta,
    quoteLine('Material per part', `${number(state.weight)} ${state.mode === 'resin' ? 'mL' : 'g'}`),
    quoteLine('Quantity', `${number(state.quantity, 0)} ${state.quantity === 1 ? 'part' : 'parts'}`),
    quoteLine('Unit price', `${money(result.price)} ${state.currency}`),
    quoteLine('Quote total', `${money(result.batchPrice)} ${state.currency}`, 'quote-grand'));
  return fragment;
}

function renderQuote() { $('quote-preview').replaceChildren(quoteContent()); }

function customerQuote() {
  const q = quoteDetails();
  return [
    'LAYERWISE — PRINT QUOTE', q.date, '', q.name,
    `Technology: ${q.technology}`, `Material: ${q.material}`,
    `Material per part: ${number(state.weight)} ${state.mode === 'resin' ? 'mL' : 'g'}`,
    `Quantity: ${state.quantity}`, `Unit price: ${money(result.price)} ${state.currency}`,
    `TOTAL: ${money(result.batchPrice)} ${state.currency}`, '',
    'Estimate only. Tax, shipping and delivery schedule are not included.',
    'Unit prices are rounded up to the nearest cent. Total = unit price × quantity.',
    'Prepared with Layerwise.'
  ].join('\n');
}

function breakdown() {
  const q = quoteDetails();
  return [
    'LAYERWISE — INTERNAL COST BREAKDOWN', q.name, `${q.technology} · ${q.material}`, q.description, '',
    ...Object.entries(result.costs).map(([key, value]) => `${costLabels[key]}: ${money(value)}`),
    `Total cost / part: ${money(result.totalCost)}`,
    `Selling fees / part: ${money(result.fees)}`,
    `Suggested price / part: ${money(result.price)}`,
    `Profit / part: ${money(result.profit)}`,
    `Achieved profit margin: ${number(result.margin, 2)}%`,
    `Quantity: ${state.quantity}`, `Quote total: ${money(result.batchPrice)} ${state.currency}`,
    `Total profit: ${money(result.batchProfit)}`, '',
    `Failure rate: ${number(state.failure)}% (applies to material, electricity and machine time).`,
    'Estimates exclude tax and shipping. Unit prices rounded up to the nearest cent.'
  ].join('\n');
}

async function copy(text) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const fallback = document.createElement('textarea');
    fallback.value = text;
    fallback.style.cssText = 'position:fixed;top:-9999px;left:0';
    document.body.append(fallback);
    fallback.select();
    let success = false;
    try { success = document.execCommand('copy'); } catch { /* Manual selection remains available in sharing dialog. */ }
    fallback.remove();
    return success;
  }
}

document.querySelectorAll('[data-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    if (state.mode === button.dataset.mode) return;
    for (const key of modeKeys) modeDrafts[state.mode][key] = state[key];
    state = { ...state, mode: button.dataset.mode, ...modeDrafts[button.dataset.mode] };
    fillInputs();
    save();
    render();
  });
});

$('material-presets').addEventListener('click', (event) => {
  const button = event.target.closest('[data-preset]');
  if (!button) return;
  const preset = presets[state.mode].find((item) => item.id === button.dataset.preset);
  state.material = preset.id;
  if (preset.price !== null) {
    state.materialPrice = preset.price;
    $('materialPrice').value = preset.price;
  }
  renderMode(); save(); render();
});

for (const key of [...Object.keys(LIMITS), 'currency', 'pricing', 'job', 'target-slider']) {
  $(key).addEventListener('input', updateFromInputs);
}
$('calculator-form').addEventListener('submit', (event) => event.preventDefault());
$('reset-button').addEventListener('click', () => {
  state = { ...DEFAULTS };
  modeDrafts.fdm = { ...DEFAULTS };
  modeDrafts.resin = { weight: 45, materialPrice: 35, hours: 2, minutes: 30, power: 60, material: 'standard' };
  if (location.hash.startsWith('#estimate=')) {
    const cleanUrl = new URL(location.href);
    cleanUrl.hash = '';
    try { history.replaceState(null, '', cleanUrl.href); }
    catch { location.hash = ''; }
  }
  fillInputs(); save(); render(); toast('A fresh start. Example defaults restored.');
});
for (const [id, delta] of [['quantity-minus', -1], ['quantity-plus', 1]]) {
  $(id).addEventListener('click', () => {
    state.quantity = Math.min(10000, Math.max(1, state.quantity + delta));
    $('quantity').value = state.quantity;
    save(); render();
  });
}
$('quote-button').addEventListener('click', () => { renderQuote(); $('quote-dialog').showModal(); });
$('close-quote').addEventListener('click', () => $('quote-dialog').close());
$('close-share').addEventListener('click', () => $('share-dialog').close());
for (const id of ['quote-dialog', 'share-dialog']) {
  $(id).addEventListener('click', (event) => {
    if (event.target !== $(id)) return;
    const rect = $(id).getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $(id).close();
  });
}
$('copy-button').addEventListener('click', async () => {
  const success = await copy(breakdown());
  toast(success ? 'Cost breakdown copied, including your internal costs and profit.' : 'Clipboard is unavailable. Please use the quote download instead.');
});
$('download-quote').addEventListener('click', () => {
  const blob = new Blob([customerQuote()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const name = (state.job.trim() || '3d-print').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 55) || '3d-print';
  anchor.download = `layerwise-${name}-quote.txt`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Quote downloaded. Internal costs and profit are not included.');
});
$('print-quote').addEventListener('click', () => {
  const brand = document.createElement('div'); brand.className = 'print-brand'; brand.textContent = 'layerwise.';
  const title = document.createElement('h1'); title.textContent = '3D printing quote';
  const date = document.createElement('p'); date.className = 'print-date'; date.textContent = quoteDetails().date;
  const note = document.createElement('p'); note.className = 'print-note';
  note.textContent = 'Estimate only. Tax, shipping and a delivery schedule are not included. Unit prices are rounded up to the nearest cent. Review before sending to a customer.';
  $('print-area').replaceChildren(brand, title, date, quoteContent(), note);
  window.print();
});
$('share-button').addEventListener('click', () => {
  const publicState = { ...state };
  delete publicState.job;
  const url = new URL(location.href);
  url.hash = new URLSearchParams({ estimate: JSON.stringify(publicState) }).toString();
  $('share-url').value = url.href;
  $('share-dialog').showModal();
  $('share-url').select();
});
$('copy-link').addEventListener('click', async () => {
  const success = await copy($('share-url').value);
  if (success) { $('share-dialog').close(); toast('Link copied. It includes your calculator settings.'); }
  else { $('share-url').focus(); $('share-url').select(); toast('Select the link and copy it manually.'); }
});

// The full-width banner sits in normal document flow and scrolls with the page.
const adDock = $('ad-dock');
if (adDock) {
  const creative = $('ad-slot-after-calculator');
  const viewport = $('ad-dock-viewport');
  const toggle = $('ad-dock-toggle');
  let dismissed = false;
  let frame = 0;
  function updateAdDock() {
    frame = 0;
    if (dismissed) return;
    const width = creative.scrollWidth;
    const height = creative.offsetHeight;
    const filled = width > 0 && height > 0;
    const scale = filled ? Math.min(1, viewport.clientWidth / width, 180 / height) : 1;
    creative.style.setProperty('--ad-scale', String(scale));
    viewport.style.height = `${Math.ceil(height * scale)}px`;
    adDock.dataset.empty = String(!filled);
    adDock.inert = !filled;
  }
  function scheduleAdDock() {
    if (!dismissed && !frame) frame = requestAnimationFrame(updateAdDock);
  }
  toggle.addEventListener('click', () => {
    dismissed = true;
    adDock.classList.add('is-dismissed');
    adDock.inert = true;
  });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(scheduleAdDock).observe(creative);
  new MutationObserver(scheduleAdDock).observe(creative, { childList: true, subtree: true, attributes: true, attributeFilter: ['width', 'height'] });
  window.addEventListener('resize', scheduleAdDock);
  updateAdDock();
}

$('year').textContent = new Date().getFullYear();
fillInputs();
render();
save();
if (sharedLoaded) toast('Shared estimate loaded. These settings are now saved on this device.');
})();
