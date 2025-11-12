// src/pages/dashboard/provider/OfferCreate.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext.jsx';
import OfferForm from '@/components/OfferForm.jsx';
import { createOffer } from '@/api/offersApi.js';
import toast from 'react-hot-toast';
import PlanGuard from '@/components/security/PlanGuard';
import DocumentSignaturePanel from '@/components/contracts/DocumentSignaturePanel.jsx';

export default function OfferCreate() {
  const [offer, setOffer] = useState({});
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.company?.branches) {
      setBranches(user.company.branches);
    } else {
      setBranches([]);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!offer.title || !offer.branchId || !offer.location) {
      toast.error('Uzupełnij wymagane pola: tytuł, oddział, lokalizacja.');
      return;
    }

    setLoading(true);
    try {
      await createOffer(offer);
      toast.success('Oferta została utworzona');
      navigate('/dashboard/provider/offers');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Błąd przy zapisie oferty';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PlanGuard>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Nowa oferta</h1>
        <form onSubmit={handleSave}>
          <OfferForm offer={offer} onChange={setOffer} branches={branches} />
          <div className="mt-6">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded disabled:opacity-60"
              disabled={loading}
              aria-disabled={loading}
            >
              {loading ? 'Zapisywanie...' : 'Zapisz ofertę'}
            </button>
          </div>
        </form>

        <DocumentSignaturePanel type="offer" />
      </div>
    </PlanGuard>
  );
}
