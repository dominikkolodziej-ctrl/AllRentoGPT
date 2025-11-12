// Ścieżka: src/utils/audit.log.js

let auditStore = [];

/**
 * Zapisuje wpis audytowy w pamięci.
 * @param {Object} payload
 * @param {string|number} payload.userId
 * @param {string} payload.action
 * @param {string} [payload.entity]
 * @param {string|number} [payload.entityId]
 * @param {any} [payload.changes]
 */
export const logAudit = (payload = {}) => {
  const {
    userId = null,
    action = "unknown",
    entity = null,
    entityId = null,
    changes = null,
  } = payload;

  const entry = Object.freeze({
    id: auditStore.length + 1,
    timestamp: new Date().toISOString(),
    userId,
    action,
    entity,
    entityId,
    changes,
  });

  auditStore.push(entry);
};

/**
 * Zwraca kopię wpisów audytowych (niemodyfikowalną z zewnątrz).
 * @returns {Array}
 */
export const getAuditLogs = () => auditStore.map((e) => ({ ...e }));
