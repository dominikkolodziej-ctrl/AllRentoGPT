import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Papa from 'papaparse';
import { useCsvValidator } from "@/hooks/useCsvValidator.js";
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1

// src/components/CsvBranchUploader.jsx

const CsvBranchUploader = ({ onUpload }) => {
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const { validateCsvRows } = useCsvValidator();
  const t = useLiveText(); // ✅ FAZA 1

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const validationErrors = validateCsvRows(data);
        setErrors(validationErrors);
        setPreview(data);
        if (validationErrors.length === 0) onUpload(data);
      },
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">
        {t("importBranchesCsv", "Importuj oddziały z pliku CSV")}
      </label>
      <input type="file" accept=".csv" onChange={handleFile} />
      {errors.length > 0 && (
        <ul className="text-red-600 text-sm list-disc ml-4">
          {errors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      )}
      {preview.length > 0 && (
        <div className="bg-gray-100 p-2 rounded text-sm">
          <strong>{t("preview", "Podgląd")}:</strong>
          <pre className="whitespace-pre-wrap max-h-48 overflow-y-auto">
            {JSON.stringify(preview.slice(0, 5), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

CsvBranchUploader.propTypes = {
  onUpload: PropTypes.func.isRequired,
};

export default CsvBranchUploader;
