import { useMemo } from 'react';
import { getSession } from '@/api/mockUserSession.js';

export const useUserPlan = () => {
  const session = useMemo(() => {
    try {
      return getSession() || {};
    } catch {
      return {};
    }
  }, []); // ✅ FAZA 5 WDROŻONA

  const plan = typeof session.plan === 'string' ? session.plan : 'start';
  const features = Array.isArray(session.features) ? session.features : [];

  return { plan, features };
};

export default useUserPlan;
