import React, { memo, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const SupportForm = ({ onSubmit, onEvent, className = '' }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('ogólne');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const labels = useMemo(
    () => ({
      title: t('support.title') || 'Centrum Pomocy',
      type: t('support.type') || 'Rodzaj zgłoszenia',
      email: t('support.email') || 'Twój adres e-mail',
      subject: t('support.subject') || 'Temat',
      message: t('support.message') || 'Opisz swój problem lub pytanie',
      submit: t('support.submit') || 'Wyślij zgłoszenie',
      required: t('support.required') || 'Wypełnij wszystkie pola.',
      badEmail: t('support.badEmail') || 'Podaj poprawny adres e-mail.',
      general: t('support.type.general') || 'Ogólne',
      rodo: t('support.type.rodo') || 'Zgłoszenie RODO',
      bug: t('support.type.bug') || 'Zgłoszenie błędu',
      feature: t('support.type.feature') || 'Propozycja funkcji',
    }),
    [t]
  );

  const validate = useCallback(() => {
    if (!email || !subject || !message) {
      setError(labels.required);
      return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setError(labels.badEmail);
      return false;
    }
    setError('');
    return true;
  }, [email, subject, message, labels.required, labels.badEmail]);

  const handleSubmit = useCallback(async () => {
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit?.({ email, subject, message, type });
      onEvent?.( 'support_submitted', { type } );
    } finally {
      setSubmitting(false);
    }
  }, [validate, submitting, onSubmit, email, subject, message, type, onEvent]);

  const container = `${className} space-y-4`;
  const inputCls = theme?.textInput ?? 'w-full border p-2 rounded';
  const selectCls = theme?.select ?? 'w-full border p-2 rounded';
  const textareaCls = theme?.textarea ?? 'w-full border p-2 rounded min-h-[120px]';
  const btnPrimary = theme?.primaryButton ?? 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60';

  const typeId = 'support-type';
  const emailId = 'support-email';
  const subjectId = 'support-subject';
  const messageId = 'support-message';
  const errorId = 'support-error';

  return (
    <div className={container} role="form" aria-labelledby="support-title" aria-describedby={error ? errorId : undefined}>
      <h2 id="support-title" className="text-xl font-bold">{labels.title}</h2>

      {error && (
        <div id={errorId} className="text-red-600 text-sm" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <label htmlFor={typeId} className="block text-sm font-medium">{labels.type}</label>
      <select id={typeId} value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
        <option value="ogólne">{labels.general}</option>
        <option value="rodo">{labels.rodo}</option>
        <option value="błąd">{labels.bug}</option>
        <option value="propozycja">{labels.feature}</option>
      </select>

      <input
        id={emailId}
        type="email"
        placeholder={labels.email}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputCls}
        aria-label={labels.email}
      />

      <input
        id={subjectId}
        type="text"
        placeholder={labels.subject}
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className={inputCls}
        aria-label={labels.subject}
      />

      <textarea
        id={messageId}
        placeholder={labels.message}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={textareaCls}
        aria-label={labels.message}
      />

      <button
        type="button"
        className={btnPrimary}
        onClick={handleSubmit}
        disabled={submitting}
        aria-disabled={submitting}
      >
        {labels.submit}
      </button>
    </div>
  );
};

SupportForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export { SupportForm };
export default memo(SupportForm);
