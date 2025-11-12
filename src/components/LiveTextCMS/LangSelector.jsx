// src/components/LiveTextCMS/LangSelector.jsx
import React from "react";
import { useLiveText } from "@/context/LiveTextContext.jsx";

export default function LangSelector() {
  const { locale, setLocale } = useLiveText();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className="border rounded px-2 py-1 text-sm"
      aria-label="Wybór języka"
    >
      <option value="pl">PL</option>
      <option value="en">EN</option>
      <option value="de">DE</option>
    </select>
  );
}
