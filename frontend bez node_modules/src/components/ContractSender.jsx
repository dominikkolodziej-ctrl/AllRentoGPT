import clsx from 'clsx';
import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1
import PropTypes from 'prop-types';
import { SignatureMethodSelector } from '@/components/contracts/SignatureMethodSelector.jsx'; // ✅ FAZA 4

const ContractSender = ({ reservations, templates, onSubmit, isOpen }) => {
  const { theme } = useTheme();
  const t = useLiveText();
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [signatureMethod, setSignatureMethod] = useState(null); // ✅ FAZA 4

  if (!isOpen) return null;

  return (
    <div className={clsx("p-6 rounded shadow", theme.background, theme.text)}>
      <h2 className="text-lg font-semibold mb-4">{t("sendContract", "Wyślij umowę")}</h2>

      <label className="block mb-2">{t("reservation", "Rezerwacja")}:</label>
      <select
        className="mb-4 w-full"
        onChange={e => setSelectedReservation(e.target.value)}
        value={selectedReservation || ""}
      >
        <option value="">{t("selectOption", "-- wybierz --")}</option>
        {reservations.map(r => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>

      <label className="block mb-2">{t("contractTemplate", "Szablon umowy")}:</label>
      <select
        className="mb-4 w-full"
        onChange={e => setSelectedTemplate(e.target.value)}
        value={selectedTemplate || ""}
      >
        <option value="">{t("selectOption", "-- wybierz --")}</option>
        {templates.map(tpl => (
          <option key={tpl.id} value={tpl.id}>
            {tpl.name}
          </option>
        ))}
      </select>

      <SignatureMethodSelector method={signatureMethod} onChange={setSignatureMethod} /> 

      <button
        onClick={() =>
          onSubmit({
            reservationId: selectedReservation,
            templateId: selectedTemplate,
            method: signatureMethod
          })
        }
        disabled={!selectedReservation || !selectedTemplate || !signatureMethod}
        className={clsx("px-4 py-2", theme.primary, theme.radius)}
      >
        {t("sendForSignature", "Wyślij do podpisu")}
      </button>
    </div>
  );
};

ContractSender.propTypes = {
  reservations: PropTypes.array.isRequired,
  templates: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default ContractSender;
