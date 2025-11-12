// src/pages/contracts/ContractManager.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DocumentSignaturePanel from '@/components/contracts/DocumentSignaturePanel.jsx';

function getFilenameFromDisposition(disposition, fallback) {
  try {
    if (!disposition) return fallback;
    // content-disposition: attachment; filename="umowa_123.pdf"
    const match = /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i.exec(disposition);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export default function ContractManager() {
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get('/api/contracts/my');
        if (active) setContracts(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (active) toast.error('Błąd ładowania umów');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const confirmReceived = async (id) => {
    try {
      await axios.post(`/api/contracts/${id}/confirm`);
      toast.success('Odbiór potwierdzony');
      setContracts((prev) => prev.map((c) => (c._id === id ? { ...c, status: 'received' } : c)));
    } catch {
      toast.error('Błąd potwierdzenia odbioru');
    }
  };

  const downloadFile = async (id) => {
    try {
      const res = await axios.get(`/api/contracts/${id}/download`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.data?.type || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fallbackName = `umowa_${id}.pdf`;
      const disposition = res.headers?.['content-disposition'];
      const filename = getFilenameFromDisposition(disposition, fallbackName);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 0);
      toast.success('Umowa pobrana');
    } catch {
      toast.error('Błąd pobierania pliku');
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📁 Twoje umowy</h2>
      {contracts.length === 0 ? (
        <p>Brak umów do wyświetlenia.</p>
      ) : (
        <ul className="space-y-4">
          {contracts.map((c) => (
            <li key={c._id} className="p-4 bg-white shadow rounded-xl border">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-gray-500">Status: {c.status}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadFile(c._id)}
                    className="btn btn-sm"
                    type="button"
                    aria-label={`Pobierz umowę ${c.title}`}
                  >
                    📥 Pobierz
                  </button>
                  {c.status !== 'received' && (
                    <button
                      onClick={() => confirmReceived(c._id)}
                      className="btn btn-sm btn-success"
                      type="button"
                      aria-label={`Potwierdź odbiór umowy ${c.title}`}
                    >
                      📨 Potwierdź odbiór
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <DocumentSignaturePanel type="contract" />
      </div>
    </div>
  );
}
