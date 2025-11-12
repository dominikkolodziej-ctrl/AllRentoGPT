import React from "react";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import { useTheme } from "@/context/ThemeContext.jsx";

export type OfferSortValue = "-updatedAt" | "updatedAt" | "title" | "-title" | "price" | "-price";

type Option = { value: OfferSortValue; labelKey: string; fallback: string };

const DEFAULT_OPTIONS: Option[] = [
  { value: "-updatedAt", labelKey: "sort.newest",    fallback: "Najnowsze" },
  { value: "updatedAt",  labelKey: "sort.oldest",    fallback: "Najstarsze" },
  { value: "title",      labelKey: "sort.titleAsc",  fallback: "Tytuł A–Z" },
  { value: "-title",     labelKey: "sort.titleDesc", fallback: "Tytuł Z–A" },
  // Jeśli BE nie wspiera sortowania po cenie – usuń dwie poniższe linie:
  { value: "-price",     labelKey: "sort.priceDesc", fallback: "Cena ↓" },
  { value: "price",      labelKey: "sort.priceAsc",  fallback: "Cena ↑" },
];

type Props = {
  value: OfferSortValue;
  onChange: (value: OfferSortValue) => void;
  options?: Option[];
  className?: string;
  "aria-label"?: string;
};

const SortDropdown: React.FC<Props> = ({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  className = "",
  "aria-label": ariaLabel,
}) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  if (!options || options.length === 0) {
    return (
      <span className={`${theme?.textSecondary || "text-gray-500"} italic`}>
        {t("offers.sort.empty") || "Brak opcji sortowania"}
      </span>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as OfferSortValue)}
      className={`border rounded p-2 ${theme?.border || "border-gray-300"} ${theme?.bgInput || ""} ${className}`}
      aria-label={ariaLabel || t("offers.sortAria") || "Sortowanie"}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {t(opt.labelKey) || opt.fallback}
        </option>
      ))}
    </select>
  );
};

export default SortDropdown;
