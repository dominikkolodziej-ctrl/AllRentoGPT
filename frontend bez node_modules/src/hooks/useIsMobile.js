import { useEffect, useState } from 'react';

export default function useIsMobile(breakpoint = 768) {
  const getIsMobile = () =>
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches
      : false;

  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = (e) => setIsMobile(e.matches);

    setIsMobile(mql.matches);
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    } else {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, [breakpoint]); // ✅ FAZA 13 WDROŻONA: wydajny listener matchMedia + SSR guard

  return isMobile;
}
