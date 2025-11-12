// src/pages/dashboard/provider/OfferEdit.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext.jsx';
import OfferForm from '@/components/OfferForm.jsx';
import toast from 'react-hot-toast';
import DocumentSignaturePanel from '@/components/contracts/DocumentSignaturePanel.jsx';

export default function OfferEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [offer, setOffer] = useState({});
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBranches(user?.company?.branches ? user.company.branches : []);
  }, [user]);

  useEffect(() => {
    if (!id || !user?.token) return;
    const ac = new AbortController();

    const fetchOffer = async () => {
      try {
        const res = await fetch(`/api/offers/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${user.token}` },
          signal: ac.signal,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.message || 'Błąd podczas ładowania oferty');
        if (!ac.signal.aborted) setOffer(data || {});
      } catch (err) {
        if (ac.signal.aborted) return;
        toast.error(err?.message || 'Błąd podczas ładowania oferty');
      }
    };

    fetchOffer();
    return () => ac.abort();
  }, [id, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...offer,
      title: (offer.title || '').trim(),
      branchId: offer.branchId,
      location: (offer.location || '').trim(),
    };

    if (!payload.title || !payload.branchId || !payload.location) {
      toast.error('Uzupełnij wymagane pola: tytuł, oddział, lokalizacja.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/offers/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || ''}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Błąd przy zapisie');
      toast.success('Oferta została zaktualizowana');
      navigate('/dashboard/provider/offers');
    } catch (err) {
      toast.error(err?.message || 'Błąd przy zapisie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edycja oferty</h1>
      <form onSubmit={handleSave}>
        <OfferForm offer={offer} onChange={setOffer} branches={branches} />
        <div className="mt-6">
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded disabled:opacity-60"
            disabled={loading}
            aria-disabled={loading}
          >
            {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>

      <DocumentSignaturePanel type="offer" />
    </div>
  );
}
