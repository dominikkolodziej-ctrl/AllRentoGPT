import { useContext, useMemo } from 'react';
import { AuthContext } from '@/context/AuthContext.jsx';

export default function usePlanAccess(required = ['pro', 'premium']) {
  const { user } = useContext(AuthContext);
  const planRaw = user?.company?.subscriptionPlan || 'start';
  const plan = typeof planRaw === 'string' ? planRaw.toLowerCase() : 'start';

  const isTrial =
    !!user?.company?.trialUntil &&
    new Date(user.company.trialUntil).getTime() > Date.now();

  const requiredSet = useMemo(
    () => new Set(required.map((p) => String(p).toLowerCase())),
    [required]
  ); // ✅ FAZA 13 WDROŻONA

  const hasAccess = requiredSet.has(plan) || isTrial;

  return { hasAccess, plan, isTrial };
}
