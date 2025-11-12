// src/components/admin/TranslationsDashboard.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import toast from "react-hot-toast";

// ✅ FAZA 1: LiveText (pośrednio – zarządzanie tłumaczeniami)
// ✅ FAZA 4: Eksport do Excela
// ✅ FAZA 2: Toasty (success/error komunikaty)

const TranslationsDashboard = () => {
  const [status, setStatus] = useState("");

  const handleImport = async () => {
    setStatus("Importuję...");
    const res = await fetch("/api/translations/import", { method: "POST" });
    const data = await res.json();
    if (data.success) toast.success("Import zakończony");
    else toast.error("Błąd importu");
    setStatus("");
  };

  const handleExport = async () => {
    setStatus("Eksportuję...");
    const res = await fetch("/api/translations/export");
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "translations.xlsx";
      a.click();
      toast.success("Eksport zakończony");
    } else toast.error("Błąd eksportu");
    setStatus("");
  };

  const handleValidate = async () => {
    setStatus("Waliduję...");
    const res = await fetch("/api/translations/validate");
    const data = await res.json();
    if (data.missing?.length > 0) {
      toast.error(`Brakuje ${data.missing.length} tłumaczeń`);
      console.warn("Brakujące klucze:", data.missing);
    } else toast.success("Wszystkie tłumaczenia są kompletne");
    setStatus("");
  };

  return (
    <Card className="p-6">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-bold">🈯 Tłumaczenia systemowe</h2>
        <div className="flex flex-col gap-4">
          <Button onClick={handleImport}>📥 Importuj z Excela</Button>
          <Button onClick={handleExport}>📤 Eksportuj do Excela</Button>
          <Button onClick={handleValidate}>🔍 Waliduj tłumaczenia</Button>
        </div>
        <p className="text-sm text-muted-foreground">{status}</p>
      </CardContent>
    </Card>
  );
};

export default TranslationsDashboard;
