'use strict';
// Adds the same immutable model snapshot used by local Recetario persistence to
// Firestore saveReceta payloads. Safe no-op when SetasDB or a matching snapshot
// is unavailable.
(function () {
  const sig = recipe => (recipe || []).map(r => `${r.id}:${Number(r.p ?? r.pct ?? 0).toFixed(2)}`).sort().join('|');
  let attempts = 0;
  const attach = () => {
    const db = globalThis.SetasDB;
    if (!db || typeof db.saveReceta !== 'function') return false;
    if (db.saveReceta.__setasSnapshotWrapped) return true;
    const original = db.saveReceta.bind(db);
    const wrapped = payload => {
      try {
        const snap = globalThis.__setasLastPeritoSnapshot;
        const recipe = payload?.ingredientes || [];
        if (snap && recipe.length && sig(recipe) === snap.recipeSignature) {
          payload = { ...payload, modelSnapshot: JSON.parse(JSON.stringify(snap)) };
        }
      } catch (_) {}
      return original(payload);
    };
    wrapped.__setasSnapshotWrapped = true;
    db.saveReceta = wrapped;
    return true;
  };
  if (attach()) return;
  const timer = setInterval(() => {
    attempts++;
    if (attach() || attempts >= 24) clearInterval(timer);
  }, 250);
})();
