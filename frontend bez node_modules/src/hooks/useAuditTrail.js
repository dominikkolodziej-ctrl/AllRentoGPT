import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

export const useAuditTrail = (entity, entityId) => {
  const [logs, setLogs] = useState([]);
  const controllerRef = useRef(null);

  const fetchLogs = useCallback(async () => {
    if (!entity || !entityId) {
      setLogs([]);
      return;
    }
    try {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const res = await axios.get('/api/audit', {
        params: { entity, entityId },
        signal: controller.signal,
      });
      const data = Array.isArray(res?.data) ? res.data : [];
      setLogs(data);
    } catch {
      // keep previous logs on error
    } finally {
      controllerRef.current = null;
    }
  }, [entity, entityId]);

  useEffect(() => {
    fetchLogs();
    return () => controllerRef.current?.abort();
  }, [fetchLogs]);

  return logs;
};

export default useAuditTrail;
