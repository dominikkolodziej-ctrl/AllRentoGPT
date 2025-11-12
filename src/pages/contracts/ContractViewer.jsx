// src/pages/contracts/ContractViewer.jsx – klient przegląda i podpisuje umowę
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext.jsx';
import { getContractsForUser, respondToContract } from '@/api/contractApi';
import toast from 'react-hot-toast';
import DocumentSignaturePanel from '@/components/contracts/DocumentSignaturePanel.jsx';

export default function ContractViewer() {
  const { user } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?._id) {
        if (active) {
          setContracts([]);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
        const data = await getContractsForUser(user._id);
        if (active) setContracts(Array.isArray(data) ? data : []);
      } catch {
        if (active) toast.error('Błąd ładowania umów');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user]);

  const handleAction = async (status) => {
    if (!selected?._id || !user?._id) return;
    setProcessing(true);
    try {
      await respondToContract(selected._id, { status, comment });
      toast.success(`Umowa ${status === 'signed' ? 'zaakceptowana' : 'odrzucona'}`);
      setSelected(null);
      setComment('');
      const data = await getContractsForUser(user._id);
      setContracts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Błąd podczas operacji');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-6 text-center" aria-busy="true">Ładowanie umów...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Twoje umowy</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {contracts.map((c) => (
          <div
            key={c._id}
            className={`border p-4 rounded shadow cursor-pointer ${c.status === 'pending' ? 'bg-yellow-50' : 'bg-gray-100'}`}
            onClick={() => setSelected(c)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setSelected(c);
            }}
            aria-label={`Umowa ${c.offer?.title || ''}, status: ${c.status}`}
          >
            <div className="font-semibold mb-1">{c.offer?.title}</div>
            <div className="text-sm text-gray-600">Status: {c.status}</div>
            <div className="text-sm text-gray-500">Od: {c.provider?.company?.name}</div>
          </div>
        ))}
        {!contracts.length && <div className="text-sm opacity-70">Brak umów do wyświetlenia.</div>}
      </div>

      {selected && (
        <div className="p-4 border rounded bg-white shadow mb-8">
          <h2 className="text-lg font-semibold mb-2">Umowa: {selected.offer?.title}</h2>
          <div
            className="prose prose-sm max-w-full mb-4"
            dangerouslySetInnerHTML={{ __html: String(selected.html || '') }}
          />

          <textarea
            placeholder="Komentarz (opcjonalnie)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border p-2 rounded mb-4"
            rows={3}
            aria-label="Komentarz do umowy"
          />

          <div className="flex gap-4">
            <button
              onClick={() => handleAction('signed')}
              className="btn btn-success"
              type="button"
              disabled={processing}
              aria-disabled={processing}
            >
              Akceptuję
            </button>
            <button
              onClick={() => handleAction('rejected')}
              className="btn btn-danger"
              type="button"
              disabled={processing}
              aria-disabled={processing}
            >
              Odrzucam
            </button>
            <button
              onClick={() => setSelected(null)}
              className="btn btn-secondary"
              type="button"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      <DocumentSignaturePanel type="contract" />
    </div>
  );
}
