import React from "react";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import { useTheme } from "@/context/ThemeContext.jsx";
import {
  STATUS_OPTIONS,
  AUDIENCE_TYPES,
  PRIORITY_FLAGS,
} from "./offer.constants"; // lub "@/constants/offer.constants" jeśli przeniosłeś

type OfferMeta = {
  status: string;
  audienceType: string;
  priority: string;
};

type OfferMetaFieldsProps = {
  meta: OfferMeta;
  setMeta: (meta: OfferMeta) => void;
};

const OfferMetaFields = ({ meta, setMeta }: OfferMetaFieldsProps) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  // 👇 wrapper, który „łagodzi” typy t(): pozwala podawać string jako fallback
  const tt = (key: string, fallback?: string) =>
    (t as unknown as (k: string, d?: unknown) => string)(key, fallback);

  const handleChange =
    (field: keyof OfferMeta) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMeta({ ...meta, [field]: e.target.value });
    };

  const labelCls = `block text-sm font-medium ${theme?.textPrimary || ""}`;
  const selectCls = `w-full rounded p-2 ${theme?.border || "border"} ${theme?.bgInput || ""}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label htmlFor="status-select" className={labelCls}>
          {tt("offer.meta.status", "Status")}
        </label>
        <select
          id="status-select"
          value={meta.status}
          onChange={handleChange("status")}
          className={selectCls}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {tt(opt.labelKey, opt.fallback)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="audience-select" className={labelCls}>
          {tt("offer.meta.audience", "Odbiorca")}
        </label>
        <select
          id="audience-select"
          value={meta.audienceType}
          onChange={handleChange("audienceType")}
          className={selectCls}
        >
          {AUDIENCE_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {tt(opt.labelKey, opt.fallback)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="priority-select" className={labelCls}>
          {tt("offer.meta.priority", "Priorytet")}
        </label>
        <select
          id="priority-select"
          value={meta.priority}
          onChange={handleChange("priority")}
          className={selectCls}
        >
          {PRIORITY_FLAGS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {tt(opt.labelKey, opt.fallback)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default OfferMetaFields;
