import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import translations from '@/locales/translations.json';
import { useLocale } from '@/context/LocaleContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const deepClone = (obj) => JSON.parse(JSON.stringify(obj || {}));

const TranslationManager = ({ onSave, onEvent, className = '' }) => {
  const { locale, switchLocale } = useLocale();
  const { t } = useLiveText();
  const { theme } = useTheme();

  const [edited, setEdited] = useState(() => deepClone(translations));
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(false);
  const undoRef = useRef(null);
  const undoTimerRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('translations.current');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setEdited((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (err) {
      console.warn('TranslationManager: failed to load from localStorage', err);
    }
  }, []);

  const filteredKeys = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return Object.keys(edited);
    return Object.keys(edited).filter((k) => k.toLowerCase().includes(q));
  }, [edited, query]);

  const handleChange = useCallback(
    (key, value) => {
      const prevVal = edited?.[key]?.[locale] ?? '';
      undoRef.current = { key, locale, prevVal };
      setCanUndo(true);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setCanUndo(false), 5000);

      setEdited((prev) => ({
        ...prev,
        [key]: { ...(prev[key] || {}), [locale]: value },
      }));
      onEvent?.('i18n_key_changed', { key, locale });
    },
    [edited, locale, onEvent]
  );

  const handleUndo = useCallback(() => {
    const u = undoRef.current;
    if (!u) return;
    setEdited((prev) => ({
      ...prev,
      [u.key]: { ...(prev[u.key] || {}), [u.locale]: u.prevVal },
    }));
    setCanUndo(false);
    onEvent?.('i18n_change_undone', { key: u.key, locale: u.locale });
  }, [onEvent]);

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem('translations.current', JSON.stringify(edited));
    } catch (err) {
      console.warn('TranslationManager: failed to persist to localStorage', err);
    }
    onSave?.(edited);
    onEvent?.('i18n_saved');
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }, [edited, onSave, onEvent]);

  const handleReset = useCallback(() => {
    setEdited(deepClone(translations));
    onEvent?.('i18n_reset');
  }, [onEvent]);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(edited, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translations.export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [edited]);

  const fileInputRef = useRef(null);
  const triggerImport = useCallback(() => fileInputRef.current?.click(), []);
  const handleImport = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result);
          if (json && typeof json === 'object') {
            setEdited((prev) => ({ ...prev, ...json }));
            onEvent?.('i18n_imported');
          }
        } catch (err) {
          console.warn('TranslationManager: invalid import file', err);
        } finally {
          e.target.value = '';
        }
      };
      reader.readAsText(file);
    },
    [onEvent]
  );

  const containerCls = `space-y-4 ${className}`;
  const inputCls = theme?.textInput ?? 'w-full border p-2 rounded';
  const btnPrimary = theme?.primaryButton ?? 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700';
  const btnSecondary = theme?.secondaryButton ?? 'px-3 py-2 bg-gray-200 rounded hover:bg-gray-300';
  const tabsBtn = (active) =>
    active ? 'px-3 py-1 rounded bg-blue-600 text-white' : 'px-3 py-1 rounded bg-gray-200';

  return (
    <div className={containerCls}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {t('i18n.manager.title') || 'Menadżer tłumaczeń'} {saved ? <span className="text-green-700 ml-2">✔</span> : null}
        </h2>
        <div className="flex gap-2">
          <button type="button" onClick={handleSave} className={btnPrimary} aria-label={t('common.save') || 'Zapisz'}>
            {t('common.save') || 'Zapisz'}
          </button>
          <button type="button" onClick={handleReset} className={btnSecondary}>
            {t('common.reset') || 'Resetuj'}
          </button>
          <button type="button" onClick={handleExport} className={btnSecondary}>
            {t('common.export') || 'Eksport'}
          </button>
          <button type="button" onClick={triggerImport} className={btnSecondary}>
            {t('common.import') || 'Import'}
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={() => switchLocale('pl')} className={tabsBtn(locale === 'pl')} aria-label="Polski">
          🇵🇱 Polski
        </button>
        <button type="button" onClick={() => switchLocale('en')} className={tabsBtn(locale === 'en')} aria-label="English">
          🇬🇧 English
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="tm-search" className="text-sm">
          {t('common.search') || 'Szukaj'}
        </label>
        <input
          id="tm-search"
          type="text"
          className={inputCls}
          placeholder={t('i18n.search.placeholder') || 'Filtruj po kluczu...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('i18n.search.placeholder') || 'Filtruj po kluczu'}
        />
        {canUndo && (
          <button type="button" onClick={handleUndo} className="underline text-sm">
            {t('undo') || 'Cofnij ostatnią zmianę'}
          </button>
        )}
      </div>

      <form className="space-y-2" aria-label={t('i18n.form') || 'Formularz tłumaczeń'}>
        {filteredKeys.map((key) => {
          const langs = edited[key] || {};
          const id = `tm-${key}`;
          return (
            <div key={key} className="mb-4">
              <label htmlFor={id} className="block text-sm font-medium mb-1">
                {key}
              </label>
              <input
                id={id}
                className={inputCls}
                value={langs[locale] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                aria-label={key}
              />
            </div>
          );
        })}
      </form>
    </div>
  );
};

TranslationManager.propTypes = {
  onSave: PropTypes.func,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export { TranslationManager };
export default memo(TranslationManager);
