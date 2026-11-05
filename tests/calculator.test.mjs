import test from 'node:test';
import assert from 'node:assert/strict';
import '../calculator.js';
const { calculate, normalize, DEFAULTS } = globalThis.LayerwiseCalculator;

const zero = { weight: 0, materialPrice: 0, hours: 0, minutes: 0, power: 0, electricity: 0, machineRate: 0, laborMinutes: 0, laborRate: 0, other: 0, failure: 0, target: 0, sellingFee: 0, fixedFee: 0, quantity: 1 };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test('a 30% margin on $10 costs is $14.29; 30% markup is $13', () => {
  const input = { ...zero, other: 10, target: 30 };
  assert.equal(calculate(input).price, 14.29);
  assert.equal(calculate({ ...input, pricing: 'markup' }).price, 13);
});
test('target margin is met after both percentage and fixed selling fees', () => {
  const r = calculate({ ...zero, other: 10, target: 30, sellingFee: 10, fixedFee: 0.2 });
  near(r.price, 17);
  near(r.profit, 5.1);
  near(r.margin, 30);
});
test('markup recovers selling fees before adding profit', () => {
  const r = calculate({ ...zero, other: 10, pricing: 'markup', target: 30, sellingFee: 10, fixedFee: 0.5 });
  assert.equal(r.price, 15);
  near(r.profit, 3);
});
test('a 20% failure rate repeats printing resources, but not finishing labor', () => {
  const r = calculate({ ...zero, weight: 100, materialPrice: 20, hours: 2, power: 100, electricity: 0.5, machineRate: 1, laborMinutes: 30, laborRate: 10, other: 1, failure: 20 });
  near(r.costs.material, 2.5);
  near(r.costs.electricity, 0.125);
  near(r.costs.machine, 2.5);
  near(r.costs.labor, 5);
  near(r.totalCost, 11.125);
});
test('resin uses mL at a per-liter price', () => {
  const r = calculate({ ...zero, mode: 'resin', weight: 50, materialPrice: 40 });
  assert.equal(r.totalCost, 2);
});
test('quote total multiplies the rounded displayed unit price', () => {
  const r = calculate({ ...zero, other: 10, target: 30, quantity: 100 });
  assert.equal(r.price, 14.29);
  near(r.batchPrice, 1429);
  assert.ok(r.margin >= 30);
});
test('invalid margin plus fees is blocked, including the exact 100% boundary', () => {
  for (const target of [90, 100, 110]) {
    assert.equal(calculate({ ...zero, target, sellingFee: 10 }).valid, false);
  }
});
test('all-zero estimate stays finite and does not produce a negative zero quote', () => {
  const r = calculate(zero);
  assert.equal(r.totalCost, 0);
  assert.equal(r.price, 0);
  assert.equal(r.margin, 0);
  assert.ok(Number.isFinite(r.profit));
});
test('shared or stored input cannot inject enum values or unbounded numeric data', () => {
  const s = normalize({ weight: -20, quantity: 1.8, failure: 100, hours: 'Infinity', currency: '<script>', mode: 'other', job: 'x'.repeat(200) });
  assert.equal(s.weight, 0);
  assert.equal(s.quantity, 1);
  assert.equal(s.failure, 95);
  assert.equal(s.hours, DEFAULTS.hours);
  assert.equal(s.currency, 'USD');
  assert.equal(s.mode, 'fdm');
  assert.equal(s.job.length, 80);
});
test('default example includes electricity and labor and produces a usable quote', () => {
  const r = calculate(DEFAULTS);
  near(r.totalCost, 7.228631578947369);
  assert.equal(r.price, 10.33);
  assert.ok(r.margin >= DEFAULTS.target);
});
