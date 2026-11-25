/** Reference prototype. No hardware, network calls or directional tracker. */
export function createAlertEngine({ confidenceThreshold = 0.8, maxAgeMs = 2000 } = {}) {
  if (!Number.isFinite(confidenceThreshold) || confidenceThreshold < 0 || confidenceThreshold > 1)
    throw new TypeError('confidenceThreshold must be between 0 and 1');
  if (!Number.isFinite(maxAgeMs) || maxAgeMs < 0) throw new TypeError('maxAgeMs must be non-negative');
  let previousDoor = 'unknown';
  let warningActive = false;
  let lastTime = -1;
  let sequence = 0;

  return {
    /** Inputs use milliseconds on the same clock. Process serialized, debounced samples. */
    process({ timestampMs, door, cat = null } = {}) {
      if (!Number.isSafeInteger(timestampMs) || timestampMs < 0 || timestampMs < lastTime)
        throw new TypeError('timestampMs must be non-negative and non-decreasing');
      if (!['open', 'closed', 'unknown'].includes(door)) throw new TypeError('Invalid door state');
      // Camera faults must never prevent a valid door-open alert.
      const validCat = cat !== null && typeof cat === 'object' &&
        typeof cat.detected === 'boolean' && typeof cat.nearExit === 'boolean' &&
        Number.isFinite(cat.confidence) && cat.confidence >= 0 && cat.confidence <= 1 &&
        Number.isSafeInteger(cat.observedAtMs) && cat.observedAtMs >= 0 &&
        cat.observedAtMs <= timestampMs && timestampMs - cat.observedAtMs <= maxAgeMs;
      const nearExit = validCat && cat.detected && cat.nearExit && cat.confidence >= confidenceThreshold;
      const warning = door === 'open' && nearExit;
      const risk = door === 'unknown' ? 'UNKNOWN' : warning ? 'WARNING' : door === 'open' ? 'INFORMATION' : 'NONE';
      const alerts = [];
      const emit = (type, level, message) => alerts.push({
        id: ++sequence, timestampMs, type, level, message, mode: 'REFERENCE_PROTOTYPE'
      });
      // Unknown -> open includes startup/reconnection: conservative baseline notification.
      if (door === 'open' && previousDoor !== 'open')
        emit('DOOR_OPEN', 'INFORMATION', 'Door is open. Please check the exit.');
      if (warning && !warningActive)
        emit('CAT_NEAR_EXIT', 'WARNING', 'Cat detected near an open exit. Please check your cat.');
      previousDoor = door;
      warningActive = warning;
      lastTime = timestampMs;
      return { timestampMs, door, risk, cameraStatus: validCat ? 'FRESH' : 'UNAVAILABLE_OR_STALE', alerts };
    }
  };
}
