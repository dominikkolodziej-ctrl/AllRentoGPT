import { useState, useCallback } from "react";
import { getBranding, setBrandingToStorage } from "@/utils/themeStorage.js";

export const useBranding = () => {
  const [branding, setBrandingState] = useState(() => {
    try {
      if (typeof window === "undefined") return {};
      const b = getBranding();
      return b && typeof b === "object" ? b : {};
    } catch {
      return {};
    }
  });

  const setBranding = useCallback((data) => {
    try {
      setBrandingToStorage(data);
    } catch {
      // ignore storage write errors
    }
    setBrandingState(data || {});
  }, []);

  return { branding, setBranding };
};

export default useBranding;
