import React, { useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ContractSender = () => {
  const [form, setForm] = useState({
    title: '',
    recipientEmail: '',
    message: '',
    requireSignature: true,
    scheduleAt: '',
  });
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) {
      toast.error('Dozwolone wyłącznie pliki PDF');
      e.target.value = '';
      setFile(null);
      return;
    }
    setFile(f);
  };

  const toISO = (local) => {
    if (!local) return '';
    const d = new Date(local);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString();
    };

  const validate = () => {
    if (!form.title.trim()) {
      toast.error('Podaj tytuł umowy');
      return false;
    }
    if (!/.+@.+\..+/.test(form.recipientEmail.trim())) {
      toast.error('Podaj poprawny adres e-mail odbiorcy');
      return false;
    }
    if (!file) {
      toast.error('Dołącz plik PDF z umową');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setForm({
      title: '',
      recipientEmail: '',
      message: '',
      requireSignature: true,
      scheduleAt: '',
    });
    setFile(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const send = async () => {
    if (!validate()) return;
    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('recipientEmail', form.recipientEmail.trim());
    if (form.message.trim()) fd.append('message', form.message.trim());
    fd.append('requireSignature', String(!!form.requireSignature));
    const iso = toISO(form.scheduleAt);
    if (iso) fd.append('scheduleAt', iso);
    fd.append('file', file);

    setIsSending(true);
    setProgress(0);
    try {
      await axios.post('/api/contracts', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (!e.total) return;
          const p = Math.round((e.loaded * 100) / e.total);
          setProgress(p);
        },
      });
      toast.success('Umowa wysłana');
      resetForm();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Błąd wysyłki umowy';
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">✉️ Wyślij umowę</h2>
      <p className="text-gray-600">Załącz plik PDF, wskaż odbiorcę i (opcjonalnie) zaplanuj wysyłkę lub oznacz wymagany podpis.</p>

      <div>
        <label className="label" htmlFor="contract-title">
          <span className="label-text">Tytuł</span>
        </label>
        <input
          id="contract-title"
          name="title"
          className="input input-bordered w-full"
          placeholder="np. Umowa najmu #2025/09"
          value={form.title}
          onChange={handleChange}
          aria-label="Tytuł umowy"
        />
      </div>

      <div>
        <label className="label" htmlFor="contract-recipient">
          <span className="label-text">E-mail odbiorcy</span>
        </label>
        <input
          id="contract-recipient"
          name="recipientEmail"
          type="email"
          className="input input-bordered w-full"
          placeholder="odbiorca@firma.com"
          value={form.recipientEmail}
          onChange={handleChange}
          aria-label="Adres e-mail odbiorcy"
        />
      </div>

      <div>
        <label className="label" htmlFor="contract-message">
          <span className="label-text">Wiadomość (opcjonalnie)</span>
        </label>
        <textarea
          id="contract-message"
          name="message"
          rows={4}
          className="textarea textarea-bordered w-full"
          placeholder="Dodatkowa treść do wiadomości…"
          value={form.message}
          onChange={handleChange}
          aria-label="Wiadomość do umowy"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="label cursor-pointer" htmlFor="contract-requireSignature">
          <span className="label-text">Wymagany podpis elektroniczny</span>
          <input
            id="contract-requireSignature"
            type="checkbox"
            name="requireSignature"
            className="toggle"
            checked={form.requireSignature}
            onChange={handleChange}
            aria-checked={form.requireSignature}
          />
        </label>

        <div>
          <label className="label" htmlFor="contract-scheduleAt">
            <span className="label-text">Zaplanuj wysyłkę (opcjonalnie)</span>
          </label>
          <input
            id="contract-scheduleAt"
            type="datetime-local"
            name="scheduleAt"
            className="input input-bordered w-full"
            value={form.scheduleAt}
            onChange={handleChange}
            aria-label="Data i godzina wysyłki"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="contract-file">
          <span className="label-text">Plik PDF z umową</span>
        </label>
        <input
          id="contract-file"
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
          aria-label="Wybierz plik PDF"
        />
        {file && (
          <div className="mt-2 text-sm opacity-80">
            Wybrano: <span className="font-mono">{file.name}</span> ({Math.round(file.size / 1024)} KB)
          </div>
        )}
      </div>

      {isSending && (
        <div className="w-full">
          <progress className="progress w-full" value={progress} max="100" />
          <div className="text-sm mt-1">{progress}%</div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={send}
          disabled={isSending}
          aria-disabled={isSending}
        >
          {isSending ? 'Wysyłanie…' : 'Wyślij umowę'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={resetForm}
          disabled={isSending}
        >
          Wyczyść
        </button>
      </div>
    </div>
  );
};

export default ContractSender;
