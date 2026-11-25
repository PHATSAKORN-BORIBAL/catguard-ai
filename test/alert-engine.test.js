import test from 'node:test';
import assert from 'node:assert/strict';
import { createAlertEngine } from '../src/alert-engine.js';
const cat = (changes = {}) => ({ detected: true, nearExit: true, confidence: 0.92, observedAtMs: 1000, ...changes });
const sample = (changes = {}) => ({ timestampMs: 1000, door: 'open', ...changes });
const run = (changes) => createAlertEngine().process(sample(changes));

test('door opening alerts without any camera input', () => {
  const r = run(); assert.equal(r.risk, 'INFORMATION'); assert.equal(r.alerts[0].type, 'DOOR_OPEN');
});
test('open door and near cat emit independent door and warning alerts', () => {
  assert.deepEqual(run({ cat: cat() }).alerts.map(a => a.type), ['DOOR_OPEN', 'CAT_NEAR_EXIT']);
});
test('closed door with near cat does not produce a warning', () => {
  const r = run({ door: 'closed', cat: cat() }); assert.equal(r.risk, 'NONE'); assert.equal(r.alerts.length, 0);
});
test('far cat does not elevate risk', () => assert.equal(run({ cat: cat({ nearExit: false }) }).risk, 'INFORMATION'));
test('low confidence does not elevate risk', () => assert.equal(run({ cat: cat({ confidence: 0.79 }) }).risk, 'INFORMATION'));
test('threshold is inclusive', () => assert.equal(run({ cat: cat({ confidence: 0.8 }) }).risk, 'WARNING'));
test('no detected cat does not elevate risk', () => assert.equal(run({ cat: cat({ detected: false }) }).risk, 'INFORMATION'));
test('repeated open samples do not duplicate alerts', () => {
  const e = createAlertEngine(); e.process(sample({ cat: cat() })); assert.equal(e.process(sample({ cat: cat() })).alerts.length, 0);
});
test('rapid close and reopen always emit new door alerts', () => {
  const e = createAlertEngine(); e.process(sample()); e.process(sample({ timestampMs: 1001, door: 'closed' }));
  assert.equal(e.process(sample({ timestampMs: 1002 })).alerts[0].type, 'DOOR_OPEN');
});
test('cat appearing after open elevates immediately', () => {
  const e = createAlertEngine(); e.process(sample()); assert.deepEqual(e.process(sample({ cat: cat() })).alerts.map(a => a.type), ['CAT_NEAR_EXIT']);
});
test('warning clears and rearms after cat leaves', () => {
  const e = createAlertEngine(); e.process(sample({ cat: cat() })); e.process(sample({ cat: cat({ nearExit: false }) }));
  assert.equal(e.process(sample({ cat: cat() })).alerts[0].level, 'WARNING');
});
test('stale detections do not cause warning or suppress door alert', () => {
  const r = run({ timestampMs: 4000, cat: cat() }); assert.equal(r.risk, 'INFORMATION'); assert.equal(r.alerts.length, 1);
});
test('future detection is unavailable', () => assert.equal(run({ cat: cat({ observedAtMs: 1001 }) }).cameraStatus, 'UNAVAILABLE_OR_STALE'));
test('malformed camera input cannot block door event', () => {
  for (const c of [null, {}, true, 'cat', cat({ confidence: NaN }), cat({ confidence: 92 }), cat({ detected: 'true' })])
    assert.equal(run({ cat: c }).alerts[0].type, 'DOOR_OPEN');
});
test('unknown door is explicit uncertainty', () => {
  const r = run({ door: 'unknown', cat: cat() }); assert.equal(r.risk, 'UNKNOWN'); assert.equal(r.alerts.length, 0);
});
test('reconnection to open emits baseline alert', () => {
  const e = createAlertEngine(); e.process(sample()); e.process(sample({ door: 'unknown' })); assert.equal(e.process(sample()).alerts.length, 1);
});
test('unverified crossing flags cannot generate critical', () => {
  assert.equal(run({ cat: cat({ crossing: true, direction: 'outward', verified: true }) }).risk, 'WARNING');
});
test('out-of-order samples are rejected without state mutation', () => {
  const e = createAlertEngine(); e.process(sample({ door: 'closed' }));
  assert.throws(() => e.process(sample({ timestampMs: 999 })), TypeError);
  assert.equal(e.process(sample()).alerts[0].type, 'DOOR_OPEN');
});
test('invalid door input is rejected', () => assert.throws(() => run({ door: true }), TypeError));
test('invalid configuration is rejected', () => {
  for (const confidenceThreshold of [-1, 2, NaN]) assert.throws(() => createAlertEngine({ confidenceThreshold }), TypeError);
  assert.throws(() => createAlertEngine({ maxAgeMs: -1 }), TypeError);
});
test('events receive unique local sequence numbers', () => {
  const r = run({ cat: cat() }); assert.equal(new Set(r.alerts.map(a => a.id)).size, 2);
});
