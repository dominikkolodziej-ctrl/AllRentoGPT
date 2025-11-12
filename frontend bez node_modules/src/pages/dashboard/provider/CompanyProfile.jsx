// src/pages/dashboard/provider/CompanyProfile.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useToast } from '@/components/ui/use-toast';

export default function CompanyProfile() {
  const { authUser } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState({
    name: '',
    nip: '',
    address: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const { _id: userId, token } = authUser || {};

  useEffect(() => {
    if (!userId) return;
    const ac = new AbortController();

    const fetchCompany = async () => {
      try {
        const res = await fetch(`/api/company/${encodeURIComponent(userId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: ac.signal,
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.message || 'Nie udało się pobrać danych firmy');
        setData({
          name: json?.name ?? '',
          nip: json?.nip ?? '',
          address: json?.address ?? '',
          description: json?.description ?? '',
        });
      } catch (err) {
        if (ac.signal.aborted) return;
        toast({ title: 'Błąd', description: err.message || 'Nie udało się pobrać danych', variant: 'destructive' });
      }
    };

    fetchCompany();
    return () => ac.abort();
  }, [userId, token, toast]);

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !token) {
      toast({ title: 'Błąd', description: 'Brak autoryzacji użytkownika', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/company/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name.trim(),
          nip: data.nip.trim(),
          address: data.address.trim(),
          description: data.description.trim(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || 'Nie udało się zapisać danych firmy');
      toast({ title: 'Zapisano', description: 'Dane firmy zostały zaktualizowane' });
    } catch (err) {
      toast({ title: 'Błąd', description: err.message || 'Nie udało się zapisać', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto" aria-busy={loading}>
      <h1 className="text-2xl font-bold">Profil firmy</h1>
      <Input name="name" value={data.name} onChange={handleChange} placeholder="Nazwa firmy" required />
      <Input name="nip" value={data.nip} onChange={handleChange} placeholder="NIP" required />
      <Input name="address" value={data.address} onChange={handleChange} placeholder="Adres" required />
      <Textarea name="description" value={data.description} onChange={handleChange} placeholder="Opis działalności" rows={4} />
      <Button type="submit" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz zmiany'}</Button>
    </form>
  );
}
