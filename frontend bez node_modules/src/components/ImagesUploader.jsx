import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const ImagesUploader = ({ images, setImages, onFiles, onEvent, className = '' }) => {
  const { t } = useLiveText();
  const theme = useTheme();
  const classes = theme?.classes ?? {};
  const btnDanger =
    classes.buttonDanger ??
    'absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100';
  const inputStyle = classes.fileInput ?? 'w-full';
  const gridStyle = classes.grid ?? 'grid grid-cols-3 gap-4';

  const generatedUrlsRef = useRef(new Set());
  const lastRemovedRef = useRef(null);
  const undoTimerRef = useRef(null);
  const [undoVisible, setUndoVisible] = useState(false);

  const handleImageChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const previews = files.map((file) => {
        const url = URL.createObjectURL(file);
        generatedUrlsRef.current.add(url);
        return url;
      });
      setImages((prev) => [...prev, ...previews]);
      onFiles?.(files);
      onEvent?.('images_added', { count: files.length });
      e.target.value = '';
    },
    [setImages, onFiles, onEvent]
  );

  const removeImage = useCallback(
    (index) => {
      setImages((prev) => {
        const updated = [...prev];
        const [removed] = updated.splice(index, 1);
        if (removed && generatedUrlsRef.current.has(removed)) {
          URL.revokeObjectURL(removed);
          generatedUrlsRef.current.delete(removed);
        }
        lastRemovedRef.current = removed ? { url: removed, index } : null;
        return updated;
      });
      onEvent?.('image_removed', { index });
      setUndoVisible(true);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setUndoVisible(false), 5000);
    },
    [setImages, onEvent]
  );

  const handleUndoRemove = useCallback(() => {
    const last = lastRemovedRef.current;
    if (!last) return;
    setImages((prev) => {
      const updated = [...prev];
      const i = Math.min(last.index, updated.length);
      updated.splice(i, 0, last.url);
      generatedUrlsRef.current.add(last.url);
      return updated;
    });
    onEvent?.('image_remove_undone', { index: last.index });
    setUndoVisible(false);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, [setImages, onEvent]);

  useEffect(() => {
    const urlsSet = generatedUrlsRef.current;
    const timerRef = undoTimerRef;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const url of urlsSet) URL.revokeObjectURL(url);
      urlsSet.clear();
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="images-input" className="sr-only">
          {t('Dodaj zdjęcia')}
        </label>
        <input
          id="images-input"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className={inputStyle}
        />
      </div>

      {undoVisible && (
        <button
          type="button"
          onClick={handleUndoRemove}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-900"
        >
          {t('Cofnij usunięcie')}
        </button>
      )}

      <div className={gridStyle}>
        {images.map((img, idx) => (
          <div key={`${img}-${idx}`} className="relative group">
            <img src={img} alt={t('Podgląd obrazu')} className="object-cover w-full h-32 rounded-lg" />
            <button type="button" onClick={() => removeImage(idx)} className={btnDanger} aria-label={t('Usuń')}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

ImagesUploader.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  setImages: PropTypes.func.isRequired,
  onFiles: PropTypes.func,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default ImagesUploader;
