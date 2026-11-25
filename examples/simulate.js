import { createAlertEngine } from '../src/alert-engine.js';
const engine = createAlertEngine();
const samples = [
  { timestampMs: 0, door: 'closed' },
  { timestampMs: 1000, door: 'open' },
  { timestampMs: 1500, door: 'open', cat: { detected: true, nearExit: true, confidence: 0.92, observedAtMs: 1500 } },
  { timestampMs: 2000, door: 'closed' },
  { timestampMs: 2500, door: 'open' }
];
console.log('SIMULATION ONLY - no camera, sensor or notification service connected');
for (const sample of samples) console.log(JSON.stringify(engine.process(sample), null, 2));
