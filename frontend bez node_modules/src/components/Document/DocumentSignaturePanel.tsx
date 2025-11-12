import React, { useState } from 'react';
import SignatureMethodSelector from "@/components/Signature/SignatureMethodSelector";
import SignatureStatusTag from "@/components/Signature/SignatureStatusTag";

type Props = {
  type?: string;
};

const DocumentSignaturePanel = ({ type = "contract" }: Props) => {
  const [method, setMethod] = useState("bank");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("method", method);
    formData.append("firmaId", "mock-firma-id");

    const res = await fetch("/api/uploadSigned", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      setStatus(method === "autenti" ? "signed_external_autenti" : `signed_by_${method}`);
    }
  };

  return (
    <div className="space-y-4 border rounded p-4 bg-gray-50">
      <p className="text-sm text-gray-600">📄 Podpis dokumentu: <strong>{type}</strong></p>
      <SignatureMethodSelector selected={method} onSelect={setMethod} />
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm"
      />
      <button
        type="button"
        onClick={handleUpload}
        className="bg-indigo-600 text-white px-4 py-2 rounded text-sm"
        disabled={!file}
      >
        📤 Wyślij podpisany plik
      </button>
      {status && (
        <div className="text-sm mt-2">
          Status: <SignatureStatusTag status={status} />
        </div>
      )}
    </div>
  );
};

export default DocumentSignaturePanel;
