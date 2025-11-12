import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import toast from 'react-hot-toast';

const initialReports = [
  { id: 'r1', content: 'Użytkownik dodał nieodpowiednią treść', date: '2025-06-13' },
  { id: 'r2', content: 'Zgłoszenie SPAM-u', date: '2025-06-12' },
];

const ModerationInbox = () => {
  const theme = useTheme();
  const [items, setItems] = useState(
    initialReports.map((r) => ({ ...r, read: false, replyDraft: '' }))
  );

  useEffect(() => {
    // miejsce na ewentualne podpięcie backendu (zachowanie bezpieczne – lokalny stan)
  }, []);

  const markAsRead = (id) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)));
    toast.success('Zgłoszenie oznaczone jako przeczytane');
  };

  const markAllAsRead = () => {
    setItems((prev) => prev.map((r) => ({ ...r, read: true })));
    toast.success('Wszystkie zgłoszenia oznaczone jako przeczytane');
  };

  const updateDraft = (id, value) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, replyDraft: value } : r)));
  };

  const sendReply = (id) => {
    const report = items.find((r) => r.id === id);
    const text = (report?.replyDraft || '').trim();
    if (!text) {
      toast.error('Wpisz treść odpowiedzi.');
      return;
    }
    // symulacja wysyłki odpowiedzi; wpięcie backendu możliwe bez zmiany API komponentu
    toast.success('Odpowiedź wysłana');
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, replyDraft: '', read: true } : r))
    );
  };

  return (
    <div className={clsx('p-6', theme.background, theme.text)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Zgłoszenia do moderacji</h2>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={markAllAsRead}
          aria-label="Oznacz wszystkie jako przeczytane"
        >
          Oznacz wszystkie jako przeczytane
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((report) => (
          <li
            key={report.id}
            className={clsx(
              'p-4 rounded border',
              theme.border,
              report.read && 'opacity-70'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1">{report.content}</p>
                <small className="text-xs">{report.date}</small>
              </div>
              {!report.read && (
                <button
                  type="button"
                  className="btn btn-xs btn-outline"
                  onClick={() => markAsRead(report.id)}
                  aria-label={`Oznacz zgłoszenie ${report.id} jako przeczytane`}
                >
                  Oznacz jako przeczytane
                </button>
              )}
            </div>

            <div className="mt-3">
              <label className="label" htmlFor={`reply-${report.id}`}>
                <span className="label-text">Odpowiedz</span>
              </label>
              <textarea
                id={`reply-${report.id}`}
                className="textarea textarea-bordered w-full"
                rows={2}
                value={report.replyDraft}
                onChange={(e) => updateDraft(report.id, e.target.value)}
                aria-label={`Treść odpowiedzi dla zgłoszenia ${report.id}`}
              />
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => sendReply(report.id)}
                >
                  Wyślij odpowiedź
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModerationInbox;
