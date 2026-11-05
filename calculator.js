/** All input costs and quantities are per finished part. Currency is a label, not FX. */
(function (root) {
'use strict';

const DEFAULTS = {
  mode: 'fdm', currency: 'USD', material: 'pla', weight: 85, materialPrice: 22,
  hours: 4, minutes: 30, power: 120, electricity: 0.18,
  machineRate: 0.35, laborMinutes: 10, laborRate: 18,
  other: 0.5, failure: 5, pricing: 'margin', target: 30,
  sellingFee: 0, fixedFee: 0, quantity: 1, job: ''
};

const LIMITS = {
  weight: [0, 1000000], materialPrice: [0, 100000], hours: [0, 10000],
  minutes: [0, 59], power: [0, 100000], electricity: [0, 1000],
  machineRate: [0, 100000], laborMinutes: [0, 100000], laborRate: [0, 100000],
  other: [0, 1000000], failure: [0, 95], target: [0, 1000],
  sellingFee: [0, 99], fixedFee: [0, 100000], quantity: [1, 10000]
};

function normalize(input = {}) {
  const result = { ...DEFAULTS };
  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    const value = input[key];
    if (value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value))) {
      result[key] = Math.min(max, Math.max(min, Number(value)));
    }
  }
  result.quantity = Math.trunc(result.quantity);
  result.hours = Math.trunc(result.hours);
  result.minutes = Math.trunc(result.minutes);
  result.mode = input.mode === 'resin' ? 'resin' : 'fdm';
  result.currency = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(input.currency) ? input.currency : 'USD';
  result.material = ['pla', 'petg', 'abs', 'custom', 'standard', 'tough', 'water'].includes(input.material) ? input.material : 'pla';
  result.pricing = input.pricing === 'markup' ? 'markup' : 'margin';
  result.job = typeof input.job === 'string' ? input.job.slice(0, 80) : '';
  return result;
}

function calculate(input) {
  const s = normalize(input);
  const duration = s.hours + s.minutes / 60;
  // Failed prints consume material, machine time and energy. Finishing and
  // packaging are charged once per successful part, not once per attempt.
  const attempts = 1 / (1 - s.failure / 100);
  const costs = {
    material: s.weight / 1000 * s.materialPrice * attempts,
    electricity: duration * s.power / 1000 * s.electricity * attempts,
    machine: duration * s.machineRate * attempts,
    labor: s.laborMinutes / 60 * s.laborRate,
    other: s.other
  };
  const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);
  const feeRate = s.sellingFee / 100;
  const target = s.target / 100;
  if (s.pricing === 'margin' && target + feeRate >= 1) {
    return { valid: false, error: 'Target margin and selling fee must add up to less than 100%.', costs, totalCost, duration };
  }
  const rawPrice = s.pricing === 'margin'
    ? (totalCost + s.fixedFee) / (1 - target - feeRate)
    : (totalCost * (1 + target) + s.fixedFee) / (1 - feeRate);
  // A quote must multiply the displayed unit price, not a hidden fraction of
  // a cent. Round up so rounding cannot lower the selected target margin.
  const price = Math.max(0, Math.ceil((rawPrice - 1e-10) * 100) / 100);
  const fees = price * feeRate + s.fixedFee;
  const profit = price - fees - totalCost;
  return {
    valid: true, costs, totalCost, duration, price, fees, profit,
    margin: price > 0 ? profit / price * 100 : 0,
    batchPrice: price * s.quantity, batchCost: totalCost * s.quantity,
    batchProfit: profit * s.quantity,
    failureAllowance: (s.weight / 1000 * s.materialPrice + duration * (s.power / 1000 * s.electricity + s.machineRate)) * (attempts - 1)
  };
}

// Classic scripts work from both file:// and HTTP without a build step.
root.LayerwiseCalculator = Object.freeze({ DEFAULTS, LIMITS, normalize, calculate });
})(globalThis);
