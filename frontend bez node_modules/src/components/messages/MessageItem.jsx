import PropTypes from 'prop-types';
import React from 'react';

// src/components/messages/MessageItem.jsx
import { useAuth } from "@/context/AuthContext.jsx";
import classNames from "classnames";
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

const MessageItem = ({ message }) => {
  const { user } = useAuth();
  const t = useLiveText; // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy
  const isOwn = user?.id === message.senderId;

  return (
    <div
      className={classNames(
        "flex flex-col max-w-[70%] p-3 rounded-lg shadow",
        theme.bgCard,
        theme.textPrimary,
        isOwn ? "bg-blue-100 self-end text-right" : "bg-white self-start text-left"
      )}
    >
      <div className="text-sm text-gray-600 font-medium">
        {isOwn ? t('messages.you') || "Ty" : message.sender?.name || t('messages.user') || "Użytkownik"}
      </div>
      <div className="text-gray-800 mb-2">{message.content}</div>
      {message.attachments?.length > 0 && (
        <ul className="text-sm text-blue-600 space-y-1">
          {message.attachments.map((file, idx) => (
            <li key={idx}>
              <a
                href={`/uploads/${file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {t('messages.attachment') || 'Załącznik'} {idx + 1}
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="text-xs text-gray-400 mt-1">
        {new Date(message.createdAt).toLocaleString()}
      </div>
    </div>
  );
};

MessageItem.propTypes = {
  message: PropTypes.shape({
    senderId: PropTypes.string,
    sender: PropTypes.shape({
      name: PropTypes.string
    }),
    content: PropTypes.string,
    attachments: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
  }).isRequired
};

export default MessageItem;
