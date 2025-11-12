import { useLiveText } from '@/context/LiveTextContext.jsx';

const useExport = (): { exportData: (selected: Record<string, boolean>, format: string) => void } => {
  const { t } = useLiveText(); // ✅ FAZA 1 WDROŻONA: tłumaczenia etykiet eksportu

  const exportData = (selected: Record<string, boolean>, format: string): void => {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(selected)) {
      if (val) params.append('include', key);
    }

    fetch(`/api/export/${format}?${params.toString()}`)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const baseName = t('export.filename') || 'dane';
        a.href = url;
        a.download = `${baseName}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
  };

  return { exportData };
};

export default useExport;
export { useExport };
