// src/utils/themeStorage.js

const STORAGE_KEY = "branding";

export const DEFAULT_BRANDING = Object.freeze({
  primaryColor: "#0070f3",
  font: "Arial",
  logo: "",
});

const sanitizeBranding = (b = {}) => {
  const out = {
    primaryColor:
      typeof b.primaryColor === "string" && b.primaryColor.trim() ? b.primaryColor : DEFAULT_BRANDING.primaryColor,
    font: typeof b.font === "string" && b.font.trim() ? b.font : DEFAULT_BRANDING.font,
    logo: typeof b.logo === "string" ? b.logo : DEFAULT_BRANDING.logo,
  };
  return out;
};

export const getBranding = () => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return { ...DEFAULT_BRANDING };
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BRANDING };
    const parsed = JSON.parse(raw);
    return sanitizeBranding({ ...DEFAULT_BRANDING, ...parsed });
  } catch {
    return { ...DEFAULT_BRANDING };
  }
};

export const setBrandingToStorage = (branding) => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const sanitized = sanitizeBranding({ ...DEFAULT_BRANDING, ...branding });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return true;
  } catch {
    return false;
  }
};

export default { getBranding, setBrandingToStorage, DEFAULT_BRANDING };
