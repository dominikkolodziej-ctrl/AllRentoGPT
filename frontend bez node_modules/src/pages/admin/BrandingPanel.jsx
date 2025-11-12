import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';
import LivePreviewRenderer from '@/components/theme/LivePreviewRenderer.jsx';
import ThemeVersionManager from '@/components/theme/ThemeVersionManager.jsx';
import BrandingPreview from '@/components/ui/BrandingPreview.jsx';

const fontOptions = ['Arial', 'Inter', 'Roboto', 'Montserrat', 'Open Sans'];

const BrandingPanel = () => {
  const { theme } = useTheme();
  const { t } = useLiveText();

  const [color, setColor] = useState('#000000');
  const [font, setFont] = useState('Arial');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [asDraft, setAsDraft] = useState(true);
  const [saving, setSaving] = useState(false);

  const logoUrlRef = useRef(null);

  useEffect(() => {
    if (logoUrlRef.current) {
      URL.revokeObjectURL(logoUrlRef.current);
      logoUrlRef.current = null;
    }
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    logoUrlRef.current = url;
    setLogoPreview(url);
    return () => {
      if (logoUrlRef.current) {
        URL.revokeObjectURL(logoUrlRef.current);
        logoUrlRef.current = null;
      }
    };
  }, [logoFile]);

  const logEvent = useCallback((message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'BrandingPanel',
        level: 'info',
        message,
        ...(extra || {}),
      });
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/log', blob);
      } else {
        fetch('/api/analytics/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => undefined);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const branding = useMemo(
    () => ({ primaryColor: color, font, logo: logoPreview }),
    [color, font, logoPreview]
  );

  const update = useCallback(async () => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append('primaryColor', color);
      form.append('font', font);
      form.append('draft', String(asDraft));
      if (logoFile) form.append('logo', logoFile);

      const res = await fetch('/api/theme/update', {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast.success(t('branding.saved') || 'Zapisano branding');
      logEvent('branding_saved', { draft: asDraft });
    } catch {
      toast.error(t('branding.saveError') || 'Nie udało się zapisać brandingu');
      logEvent('branding_save_error');
    } finally {
      setSaving(false);
    }
  }, [color, font, asDraft, logoFile, t, logEvent]);

  return (
    <LivePreviewRenderer>
      <div
        className="p-6"
        style={{
          backgroundColor: theme?.surface || theme?.background || undefined,
          color: theme?.text || undefined,
        }}
      >
        <ThemeVersionManager className="space-y-4">
          <h2 className="text-xl font-bold">
            {t('branding.title') || 'Dostosuj branding'}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3">
              <span>{t('branding.primaryColor') || 'Kolor główny'}</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label={t('branding.primaryColor') || 'Kolor główny'}
                style={{ accentColor: theme?.primary || undefined }}
              />
            </label>

            <label className="flex items-center gap-3">
              <span>{t('branding.font') || 'Czcionka'}</span>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="select select-bordered"
                aria-label={t('branding.font') || 'Czcionka'}
              >
                {fontOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3">
              <span>{t('branding.logo') || 'Logo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                aria-label={t('branding.logo') || 'Logo'}
              />
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={asDraft}
                onChange={() => setAsDraft((v) => !v)}
                aria-checked={asDraft}
                style={{ accentColor: theme?.primary || undefined }}
              />
              <span>{t('branding.saveAsDraft') || 'Zapisz jako wersję roboczą'}</span>
            </label>
          </div>

          <BrandingPreview branding={branding} />

          <button
            onClick={update}
            disabled={saving}
            className="px-4 py-2 rounded text-white"
            style={{
              backgroundColor: theme?.primary || '#2563eb',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? t('branding.saving') || 'Zapisywanie...' : t('branding.save') || 'Zapisz'}
          </button>
        </ThemeVersionManager>
      </div>
    </LivePreviewRenderer>
  );
};

export default BrandingPanel;
