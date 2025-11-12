// src/pages/contracts/ContractArchive.jsx
import clsx from 'clsx';
import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import DocumentUploader from '@/components/ui/DocumentUploader.jsx';
import { mockDocuments } from '@/api/mockDocuments.js';
import DocumentSignaturePanel from "@/components/Document/DocumentSignaturePanel.tsx";

const formatSizeKb = (size) => {
  const n = Number(size);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `${(n / 1024).toFixed(1)} KB`;
};

const ContractArchive = () => {
  const theme = useTheme();
  const [docs, setDocs] = useState(mockDocuments);

  const handleUpload = (file) => {
    if (!file) return;
    setDocs((prev) => [
      ...prev,
      { name: file.name, size: file.size, uploaded: new Date().toISOString() },
    ]);
  };

  const handleDelete = (name, uploaded) => {
    setDocs((prev) => prev.filter((doc) => !(doc.name === name && doc.uploaded === uploaded)));
  };

  return (
    <div className={clsx('p-6 space-y-4', theme.background, theme.text)}>
      <h2 className="text-xl font-bold">📑 Moje dokumenty</h2>
      <DocumentUploader onUpload={handleUpload} />

      <ul className="mt-4 space-y-2">
        {docs.map((doc) => {
          const key = `${doc.name}-${doc.uploaded}`;
          return (
            <li
              key={key}
              className="flex justify-between items-center border p-2 rounded bg-white"
            >
              <div>
                <div className="font-medium">{doc.name}</div>
                <div className="text-sm text-gray-500">
                  {formatSizeKb(doc.size)} –{' '}
                  {doc.uploaded ? new Date(doc.uploaded).toLocaleString() : '—'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(doc.name, doc.uploaded)}
                className="btn btn-sm btn-error"
                aria-label={`Usuń dokument ${doc.name}`}
              >
                Usuń
              </button>
            </li>
          );
        })}
        {!docs.length && (
          <li className="text-sm opacity-70">Brak dokumentów w archiwum.</li>
        )}
      </ul>

      <div className="mt-6">
        <DocumentSignaturePanel type="contract" />
      </div>
    </div>
  );
};

export default ContractArchive;
