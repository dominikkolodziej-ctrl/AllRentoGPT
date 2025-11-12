// Ścieżka: src/hooks/useAlertScanner.ts
import { useEffect, useState } from 'react';

type Offer = {
  id: string | number;
  title?: string;
  images?: unknown[];
  description?: string;
  companyId?: string | number | null;
  aiTags?: string[];
};

type AlertItem = {
  id: string | number;
  issues: string[];
  title?: string;
};

export const useAlertScanner = (offers: Offer[] | null | undefined): AlertItem[] => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    if (!offers || offers.length === 0) {
      setAlerts([]);
      return;
    }

    const results: AlertItem[] = offers.reduce<AlertItem[]>((acc, offer) => {
      const issues: string[] = [];

      if (!Array.isArray(offer.images) || offer.images.length === 0) issues.push('Brak zdjęć');
      if (!offer.description || offer.description.trim().length < 20) issues.push('Opis zbyt krótki');
      if (!offer.companyId) issues.push('Brak firmy przypisanej');
      if (offer.title && offer.title.toLowerCase().includes('test')) issues.push("Tytuł zawiera słowo 'test'");
      if (Array.isArray(offer.aiTags) && offer.aiTags.includes('⚠️')) issues.push('AI wykryło podejrzaną ofertę');

      if (issues.length > 0) {
        const item: AlertItem = {
          id: offer.id,
          issues,
          ...(offer.title ? { title: offer.title } : {}),
        };
        acc.push(item);
      }
      return acc;
    }, []);

    setAlerts(results);
  }, [offers]);

  return alerts;
};
