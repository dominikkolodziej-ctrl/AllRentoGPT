/* eslint-disable */
import { useCallback, useRef } from 'react';
import axios from 'axios';

export const useExport = () => {
  const controllerRef = useRef(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const exportData = useCallback(async (type, format, filename) => {
    if (!type || !format) return;

    cancel();
    const controller = new AbortController();
    controllerRef.current = controller;

    let url;
    let link;

    try {
      const res = await axios.get(
        `/api/export/${encodeURIComponent(type)}?format=${encodeURIComponent(format)}`,
        { responseType: 'blob', signal: controller.signal }
      );

      const cd = res.headers?.['content-disposition'] || res.headers?.get?.('content-disposition');
      const fromHeader =
        typeof cd === 'string'
          ? (cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i)?.[1] ||
              cd.match(/filename="?([^"]+)"?/i)?.[1])
          : null;

      const safeName = filename || fromHeader || `${type}.${format}`;

      url = URL.createObjectURL(new Blob([res.data]));
      link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', safeName);
      document.body.appendChild(link);
      link.click();
    } catch {
      // ignore
    } finally {
      if (link && link.parentNode) document.body.removeChild(link);
      if (url) URL.revokeObjectURL(url);
      controllerRef.current = null;
    }
  }, [cancel]);

  return { exportData, cancel };
};

export default useExport;
