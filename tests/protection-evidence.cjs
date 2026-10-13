// Shared evidence predicates. They read observations only; no combat mutation.
function validProtection(stand, settings) {
  if (!stand || stand.type !== 'forced-stand') return false;
  const thresholds = {
    'air-limit': ['airHits', 'airHitLimit'],
    'ground-limit': ['groundHits', 'groundHitLimit'],
    'total-limit': ['totalHits', 'totalHitLimit']
  };
  const pair = thresholds[stand.reason];
  return !!pair && Number.isFinite(stand[pair[0]]) && Number.isFinite(settings[pair[1]]) &&
    settings[pair[1]] > 0 && stand[pair[0]] >= settings[pair[1]];
}
function protectionUnchanged(entry, later) {
  if (entry.body.state !== 'invulnerable' || later.hp !== entry.hp) return false;
  const stand = entry.bodyEvents.filter(e => e.type === 'forced-stand').at(-1);
  if (!stand) return false;
  const trigger = entry.events.filter(e => e.type === 'damage' && e.protectedStand).at(-1);
  if (!trigger || Math.abs(trigger.time - stand.time) > .00002 || trigger.hp !== entry.hp) return false;
  const start = entry.body.time;
  // The caller takes later before expiry; checking this prevents a wall-time test from
  // silently comparing observations from different immunity windows.
  if (later.body.state !== 'invulnerable' || later.body.time < start) return false;
  if (later.events.some(e => e.type === 'damage' && e.time > stand.time + .00002)) return false;
  return (later.samples ?? []).filter(s => s.time >= start && s.time <= later.body.time)
    .every(s => s.b.state !== 'invulnerable' || s.hp === entry.hp);
}
function protectionHistoryUnchanged(entry, later) {
  const stand = entry.bodyEvents.filter(e => e.type === 'forced-stand').at(-1);
  const end = later.bodyEvents.find(e => e.type === 'protection-ended' && e.time > stand?.time);
  if (!stand || !end) return false;
  const trigger = entry.events.filter(e => e.type === 'damage' && e.protectedStand).at(-1);
  if (!trigger || trigger.hp !== entry.hp || Math.abs(trigger.time - stand.time) > .00002) return false;
  if (later.events.some(e => e.type === 'damage' && e.time > stand.time + .00002 && e.time < end.time - .00002)) return false;
  return (later.samples ?? []).filter(s => s.time >= entry.body.time && s.time < end.time)
    .every(s => s.b.state !== 'invulnerable' || s.hp === entry.hp);
}
module.exports = {validProtection, protectionUnchanged, protectionHistoryUnchanged};
