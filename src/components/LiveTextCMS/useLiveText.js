// src/components/LiveTextCMS/useLiveText.js
import { useLiveTextContext } from '@/context/LiveTextContext.jsx';

// t("key", {diff: 1.2}) oraz t("key", "Fallback")
export function useLiveText(namespace = "") {
  const { getText, lang } = useLiveTextContext();

  const interpolate = (str, params) => {
    if (!str) return "";
    if (!params || typeof params !== "object") return str;
    return Object.keys(params).reduce(
      (acc, k) => acc.replace(new RegExp(`{\\s*${k}\\s*}`, "g"), String(params[k])),
      str
    );
  };

  const t = (key, arg2) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const raw = getText(fullKey);

    if (arg2 && typeof arg2 === "object") {
      return interpolate(raw ?? "", arg2);
    }
    const fallback = typeof arg2 === "string" ? arg2 : "";
    return raw ?? fallback;
  };

  return { t, lang };
}

export default function Component() { return null; }
