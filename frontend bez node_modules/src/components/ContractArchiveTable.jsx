import PropTypes from 'prop-types';
import React from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1
import { exportToPDF } from '@/utils/exportToPDF.js'; // ✅ FAZA 4

export const ContractArchiveTable = ({ contracts }) => {
  const t = useLiveText();

  const handleExport = (fileUrl) => {
    exportToPDF(fileUrl);
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">{t("contractArchive", "Archiwum umów")}</h2>
      <table className="w-full table-auto border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left text-sm font-medium">{t("date", "Data")}</th>
            <th className="p-2 text-left text-sm font-medium">{t("type", "Typ")}</th>
            <th className="p-2 text-left text-sm font-medium">{t("status", "Status")}</th>
            <th className="p-2 text-left text-sm font-medium">{t("preview", "Podgląd")}</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c, i) => (
            <tr key={i} className="border-t">
              <td className="p-2 text-sm">{new Date(c.sentAt).toLocaleDateString()}</td>
              <td className="p-2 text-sm">{t(c.template, c.template)}</td>
              <td className="p-2 text-sm">{t(c.status, c.status)}</td>
              <td className="p-2 text-sm space-x-4">
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {t("openPDF", "Otwórz PDF")}
                </a>
                <button
                  onClick={() => handleExport(c.fileUrl)}
                  className="text-green-600 hover:underline"
                >
                  {t("downloadPDF", "Pobierz PDF")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ContractArchiveTable.propTypes = {
  contracts: PropTypes.arrayOf(
    PropTypes.shape({
      sentAt: PropTypes.string.isRequired,
      template: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      fileUrl: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ContractArchiveTable;
