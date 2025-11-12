// 📍 src/components/admin/StagingControl.jsx
import React, { useState, useEffect } from 'react';
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js"; // ✅ FAZA 1
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

const ENVIRONMENTS = ["production", "staging", "development"];

export default function StagingControl() {
  const { t } = useLiveText(); // ✅ FAZA 1
  const [env, setEnv] = useState("production");

  useEffect(() => {
    const stored = localStorage.getItem("b2b_env_override");
    if (stored && ENVIRONMENTS.includes(stored)) {
      setEnv(stored);
    }
  }, []);

  const handleChange = (value) => {
    localStorage.setItem("b2b_env_override", value);
    setEnv(value);
    window.location.reload();
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">
        {t("stagingControl.label") || "Środowisko systemowe"}
      </span>
      <Select value={env} onValueChange={handleChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder={t("stagingControl.placeholder") || "Wybierz środowisko"} />
        </SelectTrigger>
        <SelectContent>
          {ENVIRONMENTS.map((e) => (
            <SelectItem key={e} value={e}>
              {t(`stagingControl.env.${e}`) || e.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
