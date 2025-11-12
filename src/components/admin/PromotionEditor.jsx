// Ścieżka: src/components/admin/PromotionEditor.jsx
import React, { useState } from 'react';
import axios from "axios";
import { toast } from "react-hot-toast";

import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/Label.jsx";
import { DateRangePicker } from "@/components/ui/daterangepicker";
import { Switch } from "@/components/ui/switch";

export default function PromotionEditor() {
  const { t } = useLiveText();

  const [promotion, setPromotion] = useState({
    name: "",
    code: "",
    discount: 0,
    startDate: null,
    endDate: null,
    targetPlan: "",
    isTest: false,
    isDraft: true,
  });

  const handleChange = (field, value) => {
    setPromotion((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.post("/api/promotions", promotion);
      toast.success(t("promotions.saveSuccess") || "Promocja zapisana pomyślnie");
    } catch (error) {
      console.error(error);
      toast.error(t("promotions.saveError") || "Błąd zapisu promocji");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-6 p-4">
      <CardContent className="grid gap-4">
        <div>
          <Label>{t("promotions.name") || "Nazwa promocji"}</Label>
          <Input
            value={promotion.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div>
          <Label>{t("promotions.code") || "Kod rabatowy"}</Label>
          <Input
            value={promotion.code}
            onChange={(e) => handleChange("code", e.target.value)}
          />
        </div>

        <div>
          <Label>{t("promotions.discount") || "Zniżka (%)"}</Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={promotion.discount}
            onChange={(e) => {
              const v = e.target.value;
              const n = v === "" ? 0 : parseInt(v, 10) || 0;
              handleChange("discount", Math.min(100, Math.max(0, n)));
            }}
          />
        </div>

        <div>
          <Label>{t("promotions.targetPlan") || "Plan docelowy"}</Label>
          <Input
            value={promotion.targetPlan}
            onChange={(e) => handleChange("targetPlan", e.target.value)}
          />
        </div>

        <div>
          <Label>{t("promotions.period") || "Okres promocji"}</Label>
          <DateRangePicker
            onChange={({ start, end }) => {
              handleChange("startDate", start);
              handleChange("endDate", end);
            }}
            value={{ start: promotion.startDate, end: promotion.endDate }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label>{t("promotions.testMode") || "Tryb testowy"}</Label>
          <Switch
            checked={promotion.isTest}
            onCheckedChange={(val) => handleChange("isTest", val)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label>{t("promotions.draft") || "Wersja robocza"}</Label>
          <Switch
            checked={promotion.isDraft}
            onCheckedChange={(val) => handleChange("isDraft", val)}
          />
        </div>

        <Button className="mt-4" onClick={handleSave}>
          {t("promotions.save") || "Zapisz promocję"}
        </Button>
      </CardContent>
    </Card>
  );
}
