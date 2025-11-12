// src/components/ESignaturePanel.jsx
import React, { useState } from 'react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { SignatureMethodSelector } from '@/components/contracts/SignatureMethodSelector.jsx';

const ESignaturePanel = () => {
  const { theme } = useTheme() || {};
  const { t } = useLiveText?.() || { t: (k) => k };

  const [status, setStatus] = useState('init'); // init | sending | sent | error
  const [method, setMethod] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [signingUrl, setSigningUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const sendSignatureRequest = async () => {
    if (!method) {
      toast.error(t('signature.selectMethodFirst') || 'Wybierz metodę podpisu.');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/signature/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const success = !!data?.success;
      if (!success) throw new Error('Request failed');

      setPdfUrl(data?.pdfUrl || data?.documentUrl || '');
      setSigningUrl(data?.signingUrl || data?.redirectUrl || '');
      setStatus('sent');
      toast.success(t('signature.sent') || 'Wysłano żądanie podpisu.');
    } catch (e) {
      setStatus('error');
      const msg = t('signature.error') || 'Błąd wysyłania żądania podpisu.';
      setErrorMsg(msg);
      toast.error(msg);
      if (process?.env?.NODE_ENV !== 'production') console.error(e);
    }
  };

  return (
    <div
      className={clsx(
        'p-6 rounded space-y-4',
        theme?.panel?.container || 'bg-white',
        theme?.text || 'text-gray-900',
        theme?.panel?.shadow || 'shadow'
      )}
      role="region"
      aria-live="polite"
    >
      <h2 className={clsx('text-xl font-semibold', theme?.heading)}>
        {t('signature.title') || 'Podpisz dokument'}
      </h2>

      <p className={clsx('text-sm', theme?.mutedText || 'text-gray-600')}>
        {t('signature.subtitle') ||
          'Kliknij, aby wysłać żądanie podpisu elektronicznego (Autenti, mojeID, DocuSign).'}
      </p>

      <SignatureMethodSelector method={method} onChange={setMethod} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={sendSignatureRequest}
          disabled={status === 'sending'}
          className={clsx(
            'px-4 py-2 transition',
            theme?.primary || 'bg-blue-600 text-white hover:bg-blue-700',
            theme?.radius || 'rounded-lg',
            status === 'sending' && 'opacity-70 cursor-not-allowed'
          )}
          aria-busy={status === 'sending'}
        >
          {status === 'sending'
            ? t('signature.sending') || 'Wysyłanie...'
            : t('signature.send') || 'Wyślij do podpisu'}
        </button>

        {signingUrl ? (
          <a
            href={signingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              'px-4 py-2 transition underline',
              theme?.link || 'text-blue-600 hover:text-blue-700'
            )}
          >
            {t('signature.gotoSigning') || 'Przejdź do podpisu'}
          </a>
        ) : null}
      </div>

      {status === 'sent' && (
        <p className={clsx('text-sm', theme?.successText || 'text-green-600')}>
          {t('signature.sentInfo') || '✔️ Żądanie podpisu wysłane.'}
        </p>
      )}

      {status === 'error' && (
        <p className={clsx('text-sm', theme?.errorText || 'text-red-600')}>{errorMsg}</p>
      )}

      {pdfUrl ? (
        <div className={clsx('mt-4 space-y-2', theme?.panel?.preview)}>
          <h3 className={clsx('font-medium', theme?.subheading)}>
            {t('signature.preview') || 'Podgląd dokumentu'}
          </h3>
          <div className={clsx('w-full h-96 border', theme?.border || 'border-gray-200', theme?.radius || 'rounded-lg')}>
            <iframe
              title={t('signature.preview') || 'Podgląd dokumentu'}
              src={pdfUrl}
              className="w-full h-full"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ESignaturePanel;
