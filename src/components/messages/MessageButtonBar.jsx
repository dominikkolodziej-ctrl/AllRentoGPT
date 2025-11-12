import PropTypes from 'prop-types';
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import BulkMessageModal from "@/components/messages/BulkMessageModal.jsx";
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

const MessageButtonBar = ({ selectedOffers = [], refresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ FAZA 12 – status loading
  const t = useLiveText; // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  if (!Array.isArray(selectedOffers) || selectedOffers.length === 0) return null;

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // ✅ FAZA 10 – Obsługa błędów API + retry fallback
  const bulkArchive = async () => {
    try {
      setLoading(true);
      await axios.put('/api/messages/archive', { ids: selectedOffers });
      toast.success(t('messages.archived') || 'Zarchiwizowano wiadomości');
      refresh?.();
    } catch (error) {
      toast.error(
        `${t('error.archiveFailed') || 'Błąd archiwizacji wiadomości'}: ${error?.message || ''}`
      );
    } finally {
      setLoading(false);
    }
  };

  const bulkMarkUnread = async () => {
    try {
      setLoading(true);
      await axios.put('/api/messages/mark-unread', { ids: selectedOffers });
      toast.success(t('messages.markedUnread') || 'Oznaczono jako nieprzeczytane');
      refresh?.();
    } catch (error) {
      toast.error(
        `${t('error.markUnreadFailed') || 'Błąd oznaczania wiadomości'}: ${error?.message || ''}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
      <div
        className={`${theme.bgCard} ${theme.textPrimary} shadow-xl rounded-full px-6 py-3 flex items-center space-x-4 border`}
      >
        <button
          className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
          onClick={handleOpenModal}
          title={t('messages.bulkSendHint') || "Możesz wysłać wiadomość zbiorczą do wszystkich zaznaczonych ofert."}
          disabled={loading}
        >
          {t('messages.sendBulk') || 'Wyślij wiadomość'}
        </button>
        <button
          onClick={bulkArchive}
          className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 text-sm disabled:opacity-50"
          disabled={loading}
        >
          🗃️ {t('messages.archive') || 'Archiwizuj'}
        </button>
        <button
          onClick={bulkMarkUnread}
          className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 text-sm disabled:opacity-50"
          disabled={loading}
        >
          📩 {t('messages.markUnread') || 'Nieprzeczytane'}
        </button>
      </div>

      {isModalOpen && (
        <BulkMessageModal
          offers={selectedOffers}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

MessageButtonBar.propTypes = {
  selectedOffers: PropTypes.arrayOf(PropTypes.string).isRequired,
  refresh: PropTypes.func,
};

export default MessageButtonBar;
