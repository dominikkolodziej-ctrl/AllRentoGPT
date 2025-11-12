import clsx from 'clsx';
import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import ExportButton from '@/components/common/ExportButton.jsx';
import { Link } from 'react-router-dom';
import { mockInvoices } from '@/api/mockInvoices.js';
import InvoiceStatusTag from '@/components/ui/InvoiceStatusTag.jsx';

// ✅ FAZA 12: ThemeContext zastosowany (useTheme, klasy motywu)
// ✅ FAZA 10: Export – przycisk eksportu listy

const InvoiceList = () => {
  const theme = useTheme();

  return (
    <div className={clsx('p-6 space-y-4', theme.background, theme.text)}>
      <h2 className="text-xl font-bold">Lista faktur</h2>
      <ExportButton type="invoices" />
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left font-semibold border-b">
            <th>Numer</th>
            <th>Data</th>
            <th>Kwota</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {mockInvoices.map((inv) => (
            <tr key={inv.id} className="border-t">
              <td>{inv.number}</td>
              <td>{inv.date}</td>
              <td>{inv.amount} PLN</td>
              <td>
                <InvoiceStatusTag status={inv.status} />
              </td>
              <td>
                <Link to={`/admin/invoice/${inv.id}`} className="text-blue-600 underline">
                  Podgląd
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList;
