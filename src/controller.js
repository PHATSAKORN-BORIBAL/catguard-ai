'use strict';
// Public reference implementation: pure synthetic inputs, no I/O or secrets.
const defaults = Object.freeze({ minConfidence: 0.5, edgeGapRatio: 0.08,
  centerReference: 0.18, centerShift: 0.06, padding: 0.15,
  cooldownMs: 15000, alertClosed: true, alertOpenOnly: false });
function createController(options = {}) {
  const cfg = { ...defaults, ...options };
  let stats = { day: null, count: 0, last: null, first: null, maxConfidence: 0 };
  return function evaluate(frame, now = Date.now()) {
    if (!Number.isFinite(now)) throw new TypeError('Invalid timestamp');
    const day = new Date(now).toISOString().slice(0, 10); // UTC for reproducible examples
    if (stats.day !== day) stats = { day, count: 0, last: null, first: null, maxConfidence: 0 };
    const width = Number(frame.width), height = Number(frame.height);
    if (!(width > 0 && height > 0 && Number.isFinite(width) && Number.isFinite(height))) throw new TypeError('Invalid frame dimensions');
    const all = (frame.objects || []).filter(Boolean).map(o => {
      let confidence = Number(o.confidence ?? o.conf ?? o.prob ?? 0);
      if (confidence > 1) confidence /= 100;
      return { name: String(o.name || '').trim().toLowerCase(), confidence,
        x: Number(o.x), y: Number(o.y), w: Number(o.w), h: Number(o.h) };
    }).filter(o => o.confidence >= cfg.minConfidence && o.confidence <= 1 &&
      [o.x,o.y,o.w,o.h].every(Number.isFinite) && o.w > 0 && o.h > 0);
    const by = n => all.filter(o => o.name === n);
    const left = by('door_left').sort((a,b)=>b.x-a.x)[0];
    const right = by('door_right').sort((a,b)=>a.x-b.x)[0];
    let state = 'unknown', edgeGap = null, centerGap = null;
    if (left && right) {
      const raw = right.x - (left.x + left.w);
      edgeGap = Math.max(0,raw);
      centerGap = Math.max(0, right.x + right.w/2 - left.x - left.w/2);
      state = raw/width >= cfg.edgeGapRatio ||
        centerGap/width - cfg.centerReference >= cfg.centerShift ? 'open' : 'closed';
    }
    let door = by('door')[0];
    if (!door && (left || right)) {
      const parts = [left,right].filter(Boolean);
      const x = Math.min(...parts.map(o=>o.x)), y = Math.min(...parts.map(o=>o.y));
      door = { x,y,w:Math.max(...parts.map(o=>o.x+o.w))-x,h:Math.max(...parts.map(o=>o.y+o.h))-y };
    }
    const near = o => door && o.x+o.w/2 >= Math.max(0,door.x-door.w*cfg.padding) &&
      o.x+o.w/2 <= Math.min(width,door.x+door.w*(1+cfg.padding)) &&
      o.y+o.h/2 >= Math.max(0,door.y-door.h*cfg.padding) &&
      o.y+o.h/2 <= Math.min(height,door.y+door.h*(1+cfg.padding));
    const pets = all.filter(o=>['pet_a','pet_b'].includes(o.name) && near(o));
    const personNear = by('person').some(near);
    let type = 'NONE';
    if (!personNear && state === 'open' && pets.length) type = 'PET_NEAR_OPEN_DOOR';
    else if (!personNear && state === 'closed' && pets.length && cfg.alertClosed) type = 'PET_NEAR_CLOSED_DOOR';
    else if (!personNear && state === 'open' && cfg.alertOpenOnly) type = 'DOOR_OPEN';
    const send = type !== 'NONE' && (stats.last === null || now-stats.last >= cfg.cooldownMs);
    const confidence = Math.max(0,...pets.map(o=>o.confidence));
    if (send) { stats.count++; stats.first ??= now; stats.last = now; stats.maxConfidence = Math.max(stats.maxConfidence,confidence); }
    return { doorState:state, edgeGap, centerGap, petNear:!!pets.length, personNear,
      alertType:send?type:'NONE', candidateType:type, sendAlert:send,
      confidence, stats:{...stats}, cooldownLeftMs:stats.last===null?0:Math.max(0,cfg.cooldownMs-(now-stats.last)) };
  };
}
module.exports = { createController };
