import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const MessageItem = ({ message, currentUserId, refresh, onEvent, className = '' }) => {
  const { t } = useLiveText();
  const theme = useTheme();
  const classes = theme?.classes ?? {};
  const bubbleSender = classes.messageBubbleSender ?? 'bg-blue-100 text-right';
  const bubbleReceiver = classes.messageBubbleReceiver ?? 'bg-gray-100 text-left';
  const containerBase = classes.messageContainer ?? 'p-3 rounded-lg max-w-xs w-full';
  const rowBase = classes.messageRow ?? 'flex mb-3';

  const isSender = useMemo(() => String(message?.senderId) === String(currentUserId), [message?.senderId, currentUserId]);

  const [pinned, setPinned] = useState(Boolean(message?.pinned));
  const [archived, setArchived] = useState(Boolean(message?.archived));
  const [tag, setTag] = useState(message?.tag || '');
  const [pending, setPending] = useState(false);

  const undoRef = useRef(null);
  const undoTimerRef = useRef(null);
  const [undoVisible, setUndoVisible] = useState(false);

  const showUndo = useCallback((data) => {
    undoRef.current = data;
    setUndoVisible(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoVisible(false), 5000);
  }, []);

  const togglePin = useCallback(async () => {
    if (pending) return;
    setPending(true);
    const next = !pinned;
    try {
      await axios.put(`/api/messages/${message._id}/pin`, { pinned: next });
      setPinned(next);
      toast.success(next ? t('Przypięto') : t('Odpinano'));
      onEvent?.('message_pin_toggled', { id: message._id, pinned: next });
      showUndo({ kind: 'pin', prev: pinned });
      refresh?.();
    } catch {
      toast.error(t('Nie udało się zmienić przypięcia'));
    } finally {
      setPending(false);
    }
  }, [pending, pinned, message?._id, refresh, onEvent, showUndo, t]);

  const archive = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      await axios.put(`/api/messages/${message._id}/archive`, { archived: true });
      setArchived(true);
      toast.success(t('Zarchiwizowano wiadomość'));
      onEvent?.('message_archived', { id: message._id });
      showUndo({ kind: 'archive', prev: false });
      refresh?.();
    } catch {
      toast.error(t('Nie udało się zarchiwizować'));
      setPending(false);
    }
  }, [pending, message?._id, refresh, onEvent, showUndo, t]);

  const changeTag = useCallback(
    async (newTag) => {
      if (pending) return;
      setPending(true);
      try {
        await axios.put(`/api/messages/${message._id}/tag`, { tag: newTag });
        const prev = tag;
        setTag(newTag);
        toast.success(t('Oznaczono jako: {{tag}}').replace('{{tag}}', newTag || t('brak')));
        onEvent?.('message_tag_changed', { id: message._id, tag: newTag });
        showUndo({ kind: 'tag', prev });
        refresh?.();
      } catch {
        toast.error(t('Nie udało się zmienić tagu'));
      } finally {
        setPending(false);
      }
    },
    [pending, message?._id, tag, refresh, onEvent, showUndo, t]
  );

  const undo = useCallback(async () => {
    const data = undoRef.current;
    if (!data) return;
    setUndoVisible(false);
    try {
      if (data.kind === 'pin') {
        await axios.put(`/api/messages/${message._id}/pin`, { pinned: data.prev });
        setPinned(data.prev);
        onEvent?.('message_pin_undone', { id: message._id, pinned: data.prev });
      } else if (data.kind === 'archive') {
        await axios.put(`/api/messages/${message._id}/archive`, { archived: false });
        setArchived(false);
        onEvent?.('message_archive_undone', { id: message._id });
      } else if (data.kind === 'tag') {
        await axios.put(`/api/messages/${message._id}/tag`, { tag: data.prev || '' });
        setTag(data.prev || '');
        onEvent?.('message_tag_undone', { id: message._id, tag: data.prev || '' });
      }
      toast.success(t('Cofnięto'));
      refresh?.();
    } catch {
      toast.error(t('Nie udało się cofnąć'));
    } finally {
      undoRef.current = null;
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    }
  }, [message?._id, refresh, onEvent, t]);

  if (archived) {
    return undoVisible ? (
      <div className={`${rowBase} justify-center ${className}`}>
        <button
          type="button"
          onClick={undo}
          className="text-xs bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-900"
        >
          {t('Cofnij archiwizację')}
        </button>
      </div>
    ) : null;
  }

  return (
    <div className={`${rowBase} ${isSender ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`${containerBase} ${isSender ? bubbleSender : bubbleReceiver}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold">{message.subject}</span>
          <div className="flex gap-2 text-xs">
            <button type="button" onClick={togglePin} disabled={pending} aria-label={t('Przypnij/Odepnij')}>
              {pinned ? '📌' : '📍'}
            </button>
            <button type="button" onClick={archive} disabled={pending} aria-label={t('Archiwizuj')}>
              🗃️
            </button>
            <select
              value={tag}
              onChange={(e) => changeTag(e.target.value)}
              disabled={pending}
              className="text-xs bg-transparent text-blue-600 underline"
              aria-label={t('Etykieta')}
            >
              <option value="">{t('–')}</option>
              <option value="ważne">{t('Ważne')}</option>
              <option value="techniczne">{t('Techniczne')}</option>
              <option value="finansowe">{t('Finansowe')}</option>
            </select>
          </div>
        </div>

        <p className="text-sm whitespace-pre-line">{message.content}</p>

        {Array.isArray(message.attachments) && message.attachments.length > 0 && (
          <ul className="mt-2 text-xs text-blue-600">
            {message.attachments.map((file, i) => (
              <li key={`${file?.url || i}`}>
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-gray-500">
            {format(new Date(message.createdAt), 'dd.MM.yyyy HH:mm')}
          </p>
          {undoVisible && (
            <button
              type="button"
              onClick={undo}
              className="text-[10px] bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-900"
            >
              {t('Cofnij')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

MessageItem.propTypes = {
  message: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    senderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subject: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)])
      .isRequired,
    pinned: PropTypes.bool,
    archived: PropTypes.bool,
    tag: PropTypes.string,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  refresh: PropTypes.func,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default MessageItem;
