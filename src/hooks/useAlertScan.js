import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

export const useAlertScan = () => {
  const [alerts, setAlerts] = useState([]);
  const controllerRef = useRef(null);

  const fetchAlerts = useCallback(async () => {
    try {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const res = await axios.get('/api/alerts', { signal: controller.signal });
      const data = Array.isArray(res?.data) ? res.data : [];
      setAlerts(data);
    } catch {
      // ignore fetch errors, keep previous alerts
    } finally {
      controllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 30000);
    return () => {
      clearInterval(intervalId);
      controllerRef.current?.abort();
    };
  }, [fetchAlerts]);

  return alerts;
};

export default useAlertScan;
