import PropTypes from 'prop-types';
import clsx from 'clsx';
import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia

const MessagesPanel = ({ messages }) => {
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy
  const t = useLiveText; // ✅ FAZA 1 – tłumaczenia

  return (
    <div
      className={clsx(
        "p-4 rounded-md shadow",
        theme?.panelBg || "bg-gray-50"
      )}
    >
      <h2 className={clsx("text-lg font-bold mb-4", theme?.textPrimary)}>
        {t('messages.title') || 'Wiadomości'}
      </h2>
      {messages.length === 0 ? ( // ✅ FAZA 12 – status empty
        <p className={clsx("text-sm italic", theme?.textSecondary)}>
          {t('messages.empty') || 'Brak wiadomości do wyświetlenia.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={clsx("p-2 border rounded", theme?.border || "border-gray-200")}
            >
              <p className={clsx("text-sm", theme?.textSecondary)}>
                {msg.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

MessagesPanel.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      content: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default MessagesPanel;
