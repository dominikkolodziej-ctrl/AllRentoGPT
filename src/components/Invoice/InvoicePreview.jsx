import React from 'react';
import { useSearchParams } from "react-router-dom";
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1
// import { DocumentSignaturePanel } from '@/components/Signature/DocumentSignaturePanel'; // TODO [FAZA 4: jeśli chcesz aktywować podpis]

// ✅ FAZA 4: eksport PDF faktury (preview + download)

export default function InvoicePreview() {
  const [params] = useSearchParams();
  const { t } = useLiveText(); // ✅ FAZA 1 – poprawne wywołanie hooka
  const invoiceId = params.get("id");

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">{t("invoice.preview.title")}</h2>
      <div className="border rounded shadow overflow-hidden">
        <iframe
          src={`/api/invoice/${invoiceId}/preview`}
          width="100%"
          height="800px"
          title="Invoice PDF Preview"
        />
      </div>
      <div className="mt-4">
        <a
          href={`/api/invoice/${invoiceId}/download`}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("invoice.preview.downloadButton")}
        </a>
      </div>

      {/* TODO [FAZA 4: aktywuj, jeśli chcesz podpis pod fakturą] */}
      {/* <DocumentSignaturePanel type="invoice" /> */}
    </div>
  );
}
