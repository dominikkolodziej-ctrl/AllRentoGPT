import clsx from 'clsx';
import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { mockOrganization } from '@/api/mockOrganization.js';
import RoleTag from '@/components/ui/RoleTag.jsx';

// ✅ FAZA 5: Role – podgląd ról w zespole (RoleTag)
// ✅ FAZA 1: ThemeContext użyty poprawnie

const OrganizationPanel = () => {
  const theme = useTheme();
  const members = mockOrganization;

  return (
    <div className={clsx('p-6 space-y-6', theme.background, theme.text)}>
      <h1 className="text-2xl font-bold">Zarządzanie zespołem</h1>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left border-b font-semibold">
              <th scope="col">Imię</th>
              <th scope="col">Email</th>
              <th scope="col">Rola</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={i} className="border-t">
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>
                  <RoleTag role={m.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizationPanel;
