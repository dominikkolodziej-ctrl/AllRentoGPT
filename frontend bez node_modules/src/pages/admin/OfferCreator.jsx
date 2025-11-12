import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

const OfferCreator = ({ offerId }) => {
  const { offerId: offerIdParam } = useParams();
  const resolvedOfferId = offerId ?? offerIdParam ?? null;

  const [data, setData] = useState({
    title: '',
    description: '',
    price: '',
    status: 'draft',
  });
  const [isSaving, setIsSaving] = useState(false);
  const previousDataRef = useRef(null);
  const lastToastIdRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUndo = async () => {
    const previous = previousDataRef.current;
    if (!previous || !resolvedOfferId) return;
    try {
      setIsSaving(true);
      await axios.put(`/api/offer/${encodeURIComponent(resolvedOfferId)}`, previous);
      setData(previous);
      toast.success('Przywrócono poprzednią wersję');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Błąd przywracania zmian';
      toast.error(msg);
    } finally {
      setIsSaving(false);
      if (lastToastIdRef.current) toast.dismiss(lastToastIdRef.current);
    }
  };

  const updateOffer = async (e) => {
    e?.preventDefault?.();
    if (!resolvedOfferId) {
      toast.error('Brak identyfikatora oferty');
      return;
    }
    const payload = {
      title: (data.title || '').trim(),
      description: (data.description || '').trim(),
      status: (data.status || 'draft').trim(),
      price:
        typeof data.price === 'string'
          ? Number(data.price.replace(',', '.')) || 0
          : Number(data.price) || 0,
    };
    if (!payload.title) {
      toast.error('Tytuł jest wymagany');
      return;
    }
    previousDataRef.current = { ...data };
    try {
      setIsSaving(true);
      await axios.put(`/api/offer/${encodeURIComponent(resolvedOfferId)}`, payload);
      setData({
        ...data,
        title: payload.title,
        description: payload.description,
        status: payload.status,
        price: String(payload.price),
      });
      const id = toast.custom(
        () => (
          <div className="bg-base-200 text-base-content rounded shadow px-4 py-3 flex items-center gap-3">
            <span>Zaktualizowano ofertę</span>
            <button type="button" className="btn btn-xs btn-outline" onClick={handleUndo}>
              Cofnij
            </button>
          </div>
        ),
        { duration: 5000 }
      );
      lastToastIdRef.current = id;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Błąd zapisu oferty';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="p-4 max-w-xl space-y-3" onSubmit={updateOffer}>
      <div>
        <label className="label" htmlFor="offer-title">
          <span className="label-text">Tytuł</span>
        </label>
        <input
          id="offer-title"
          name="title"
          placeholder="Tytuł"
          value={data.title}
          onChange={handleChange}
          className="w-full p-2 input input-bordered"
          required
          aria-label="Tytuł oferty"
        />
      </div>

      <div>
        <label className="label" htmlFor="offer-description">
          <span className="label-text">Opis</span>
        </label>
        <textarea
          id="offer-description"
          name="description"
          placeholder="Opis"
          value={data.description}
          onChange={handleChange}
          className="w-full textarea textarea-bordered"
          rows={4}
          aria-label="Opis oferty"
        />
      </div>

      <div>
        <label className="label" htmlFor="offer-price">
          <span className="label-text">Cena</span>
        </label>
        <input
          id="offer-price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={data.price}
          onChange={handleChange}
          className="w-full input input-bordered"
          aria-label="Cena oferty"
        />
      </div>

      <div>
        <label className="label" htmlFor="offer-status">
          <span className="label-text">Status</span>
        </label>
        <select
          id="offer-status"
          name="status"
          value={data.status}
          onChange={handleChange}
          className="select select-bordered w-full"
          aria-label="Status oferty"
        >
          <option value="draft">Szkic</option>
          <option value="published">Opublikowana</option>
          <option value="archived">Zarchiwizowana</option>
        </select>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="btn btn-success"
          disabled={isSaving || !resolvedOfferId}
          aria-disabled={isSaving || !resolvedOfferId}
        >
          {isSaving ? 'Zapisywanie…' : 'Zapisz'}
        </button>
      </div>
    </form>
  );
};

OfferCreator.propTypes = {
  offerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default OfferCreator;
