import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// ✅ FAZA 1: wybór języka + backend + html[lang] + event "app:language-changed"

const supportedLanguages = [
  { code: 'pl', label: 'Polski' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
];

export default function LanguageManager() {
  const [currentLang, setCurrentLang] = useState('pl');
  const [isSaving, setIsSaving] = useState(false);

  const applyLangLocally = useCallback((lang) => {
    document.documentElement.setAttribute('lang', lang);
    try {
      localStorage.setItem('app:lang', lang);
    } catch {
      /* storage not available */
    }
    window.dispatchEvent(new CustomEvent('app:language-changed', { detail: { lang } }));
  }, []);

  const apiFetch = useCallback(async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      if (res.status === 401) {
        toast.error('Sesja wygasła. Zaloguj się ponownie.');
        return null;
      }
      if (!res.ok) {
        let message = 'Wystąpił błąd';
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await res.json();
            message = j?.message || message;
          } else {
            message = await res.text();
          }
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) return res.json();
      return null;
    } catch (err) {
      toast.error(err?.message || 'Błąd sieci');
      return null;
    }
  }, []);

  const loadLanguage = useCallback(
    async (signal) => {
      const data = await apiFetch('/api/settings/language', { signal });
      const lang = data?.language || 'pl';
      setCurrentLang(lang);
      applyLangLocally(lang);
    },
    [apiFetch, applyLangLocally]
  );

  const updateLanguage = async (lang) => {
    if (lang === currentLang) return;
    setIsSaving(true);
    const ok = await apiFetch('/api/settings/language', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang }),
    });
    setIsSaving(false);
    if (ok !== null) {
      setCurrentLang(lang);
      applyLangLocally(lang);
      toast.success('Zmieniono język systemu');
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    loadLanguage(ac.signal);
    return () => ac.abort();
  }, [loadLanguage]);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🌍 Zarządzanie językiem aplikacji</h2>
      <p className="text-gray-600">Wybierz domyślny język interfejsu dla całej aplikacji.</p>

      <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Wybór języka">
        {supportedLanguages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`btn ${currentLang === lang.code ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => updateLanguage(lang.code)}
            aria-pressed={currentLang === lang.code}
            aria-label={`Ustaw język ${lang.label}`}
            disabled={isSaving}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
