// 📍 src/core/system/AlertTriggerEngine.js (v2 ENTERPRISE)
let engineOptions = {
  analytics: null, // (event, payload) => void
  logEndpoint: null, // '/api/alerts/log'
  getAuthToken: null, // () => string | null
};

const alertRegistry = [];

/** Konfiguracja silnika (analityka, logowanie do backendu) — ✅ FAZA 9/8 WDROŻONA */
export function configureAlertEngine(opts = {}) {
  engineOptions = { ...engineOptions, ...opts };
}

/** Rejestracja reguły (obsługa AI scoring i metadanych) — ✅ FAZA 3 WDROŻONA */
export function registerAlert(config) {
  if (!config || typeof config !== 'object') return;
  const { id, condition, action, meta, ai } = config;
  if (typeof id !== 'string') return;
  alertRegistry.push({
    id,
    condition: typeof condition === 'function' ? condition : null,
    action: typeof action === 'function' ? action : null,
    meta: meta || null,
    ai: ai || null, // { score?: () => number, threshold?: number, scoreAsync?: () => Promise<number> }
  });
}

function emitAnalytics(event, payload) {
  try {
    if (typeof engineOptions.analytics === 'function') {
      engineOptions.analytics(event, payload);
    }
  } catch (e) {
    void e;
  }
}

function postLog(payload) {
  try {
    if (!engineOptions.logEndpoint || typeof fetch !== 'function') return;
    const headers = { 'Content-Type': 'application/json' };
    const token = typeof engineOptions.getAuthToken === 'function' ? engineOptions.getAuthToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    // fire-and-forget
    fetch(engineOptions.logEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  } catch (e) {
    void e;
  }
}

function shouldFireSync(rule) {
  let ok = false;
  try {
    ok = rule.condition ? !!rule.condition() : false;
  } catch {
    ok = false;
  }
  if (!ok) return { ok: false, score: null };

  if (rule.ai && typeof rule.ai.score === 'function') {
    try {
      const score = Number(rule.ai.score());
      const threshold = Number.isFinite(rule.ai.threshold) ? Number(rule.ai.threshold) : 0.5;
      if (!(score >= threshold)) return { ok: false, score };
      return { ok: true, score };
    } catch {
      return { ok: true, score: null };
    }
  }
  return { ok: true, score: null };
}

/** Szybka ścieżka synchroniczna — ✅ FAZA 9/8 WDROŻONA */
export function runAlerts() {
  for (const rule of alertRegistry) {
    try {
      const { ok, score } = shouldFireSync(rule);
      if (!ok) continue;
      if (rule.action) rule.action();
      const payload = { id: rule.id, ts: Date.now(), meta: rule.meta, score };
      emitAnalytics('alert_fired', payload);
      postLog(payload);
    } catch (e) {
      emitAnalytics('alert_error', { id: rule.id, ts: Date.now(), error: String(e) });
    }
  }
}

/** Ścieżka asynchroniczna (AI/warunki async, logowanie await) — ✅ FAZA 3/9/8 WDROŻONA */
export async function runAlertsAsync() {
  for (const rule of alertRegistry) {
    try {
      let ok = false;
      let score = null;

      // condition async fallback
      if (rule.condition && rule.condition.constructor.name === 'AsyncFunction') {
        try {
          ok = !!(await rule.condition());
        } catch {
          ok = false;
        }
      } else {
        ({ ok, score } = shouldFireSync(rule));
      }
      if (!ok) continue;

      // AI score async
      if (rule.ai && typeof rule.ai.scoreAsync === 'function') {
        try {
          const s = Number(await rule.ai.scoreAsync());
          const threshold = Number.isFinite(rule.ai.threshold) ? Number(rule.ai.threshold) : 0.5;
          score = s;
          if (!(s >= threshold)) continue;
        } catch {
          // keep score as null
        }
      }

      if (rule.action && rule.action.constructor.name === 'AsyncFunction') {
        await rule.action();
      } else if (rule.action) {
        rule.action();
      }

      const payload = { id: rule.id, ts: Date.now(), meta: rule.meta, score };

      try {
        emitAnalytics('alert_fired', payload);
        if (engineOptions.logEndpoint && typeof fetch === 'function') {
          const headers = { 'Content-Type': 'application/json' };
          const token = typeof engineOptions.getAuthToken === 'function' ? engineOptions.getAuthToken() : null;
          if (token) headers.Authorization = `Bearer ${token}`;
          await fetch(engineOptions.logEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          }).catch(() => undefined);
        }
      } catch (e) {
        void e;
      }
    } catch (e) {
      emitAnalytics('alert_error', { id: rule.id, ts: Date.now(), error: String(e) });
    }
  }
}
