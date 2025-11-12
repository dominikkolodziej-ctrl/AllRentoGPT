import clsx from 'clsx';
import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useParams } from 'react-router-dom';
import { mockInvoices } from '@/api/mockInvoices.js';
import InvoiceStatusTag from '@/components/ui/InvoiceStatusTag.jsx';

const InvoiceViewer = () => {
  const theme = useTheme();
  const { id } = useParams();
  const invoice = mockInvoices.find((i) => i.id.toString() === id);

  if (!invoice) {
    return <div className={clsx('p-6', theme.background, theme.text)}>Nie znaleziono faktury</div>;
  }

  return (
    <div className={clsx('p-6', theme.background, theme.text)}>
      <h1 className="text-xl font-bold mb-4">Faktura {invoice.number}</h1>
      <p>
        <strong>Data:</strong> {invoice.date}
      </p>
      <p>
        <strong>Kwota:</strong> {invoice.amount} PLN
      </p>
      <p>
        <strong>Status:</strong> <InvoiceStatusTag status={invoice.status} />
      </p>
      <p>
        <strong>Odbiorca:</strong> {invoice.client}
      </p>
      <p>
        <strong>Opis:</strong> {invoice.description}
      </p>
      <a
        href={invoice.pdf}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-blue-600 underline"
        aria-label={`Pobierz PDF faktury ${invoice.number}`}
      >
        Pobierz PDF
      </a>
    </div>
  );
};

export default InvoiceViewer;
