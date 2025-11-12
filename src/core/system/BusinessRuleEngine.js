// 📍 src/core/system/BusinessRuleEngine.js (v2 ENTERPRISE)

let engineOptions = {
  analytics: null, // (event: string, payload: object) => void
  logEndpoint: null, // string | null  e.g. '/api/rules/log'
  getAuthToken: null, // () => string | null
  filter: null, // (rule, context) => boolean  — dodatkowy filtr globalny
};

const ruleRegistry = [];

/** Konfiguracja silnika (analityka, logowanie, filtry) */
export function configureBusinessRules(opts = {}) {
  engineOptions = { ...engineOptions, ...opts };
}

/**
 * Rejestruje regułę biznesową
 * @param {{ id:string, trigger:(ctx:any)=>boolean|Promise<boolean>, execute:(ctx:any)=>void|Promise<void>, tags?:string[] }} config
 */
export function registerRule(config) {
  if (!config || typeof config !== 'object') return;
  const { id, trigger, execute, tags } = config;
  if (typeof id !== 'string') return;
  const entry = {
    id,
    trigger: typeof trigger === 'function' ? trigger : null,
    execute: typeof execute === 'function' ? execute : null,
    tags: Array.isArray(tags) ? tags : [],
    meta: config.meta ?? null,
  };
  const idx = ruleRegistry.findIndex((r) => r.id === id);
  if (idx >= 0) ruleRegistry[idx] = entry;
  else ruleRegistry.push(entry);
}

/** Usuwa regułę po id */
export function unregisterRule(id) {
  const i = ruleRegistry.findIndex((r) => r.id === id);
  if (i >= 0) ruleRegistry.splice(i, 1);
}

/** Czyści wszystkie reguły */
export function clearRules() {
  ruleRegistry.length = 0;
}

/** Zwraca kopię listy reguł (opcjonalnie przefiltrowaną) */
export function getRules(filter) {
  const arr = ruleRegistry.slice();
  return typeof filter === 'function' ? arr.filter(filter) : arr;
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
    fetch(engineOptions.logEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  } catch (e) {
    void e;
  }
}

function allowedByFilter(rule, context) {
  try {
    return typeof engineOptions.filter === 'function' ? !!engineOptions.filter(rule, context) : true;
  } catch (e) {
    void e;
    return true;
  }
}

/**
 * Uruchamia przetwarzanie reguł dla danego kontekstu (synchron.)
 * @param {Object} context
 */
export function processRules(context) {
  for (const rule of ruleRegistry) {
    try {
      if (!rule.trigger || !rule.execute) continue;
      if (!allowedByFilter(rule, context)) continue;
      const ok = !!rule.trigger(context);
      if (!ok) continue;

      rule.execute(context);

      const payload = { id: rule.id, ts: Date.now(), tags: rule.tags, meta: rule.meta };
      emitAnalytics('rule_fired', payload);
      postLog(payload);
    } catch (err) {
      emitAnalytics('rule_error', { id: rule.id, ts: Date.now(), error: String(err) });
    }
  }
}

/**
 * Asynchroniczne przetwarzanie reguł (obsługa trigger/execute async)
 * @param {Object} context
 */
export async function processRulesAsync(context) {
  for (const rule of ruleRegistry) {
    try {
      if (!rule.trigger || !rule.execute) continue;
      if (!allowedByFilter(rule, context)) continue;

      let ok = false;
      if (rule.trigger.constructor.name === 'AsyncFunction') {
        try {
          ok = !!(await rule.trigger(context));
        } catch (e) {
          void e;
          ok = false;
        }
      } else {
        ok = !!rule.trigger(context);
      }
      if (!ok) continue;

      if (rule.execute.constructor.name === 'AsyncFunction') {
        await rule.execute(context);
      } else {
        rule.execute(context);
      }

      const payload = { id: rule.id, ts: Date.now(), tags: rule.tags, meta: rule.meta };
      emitAnalytics('rule_fired', payload);
      if (engineOptions.logEndpoint) {
        try {
          const headers = { 'Content-Type': 'application/json' };
          const token = typeof engineOptions.getAuthToken === 'function' ? engineOptions.getAuthToken() : null;
          if (token) headers.Authorization = `Bearer ${token}`;
          await fetch(engineOptions.logEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          }).catch(() => undefined);
        } catch (e) {
          void e;
        }
      }
    } catch (err) {
      emitAnalytics('rule_error', { id: rule.id, ts: Date.now(), error: String(err) });
    }
  }
}
