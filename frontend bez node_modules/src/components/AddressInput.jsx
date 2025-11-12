import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import usePlacesAutocomplete, { getGeocode } from 'use-places-autocomplete';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const AddressInput = ({ onAddressSelected }) => {
  const { t } = useLiveText?.() || { t: (k) => k };
  const { theme } = useTheme() || {};
  const listRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState('');

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 400,
    requestOptions: { componentRestrictions: { country: 'pl' } },
  });

  const pickSuggestion = async (description) => {
    if (!description) return;
    setValue(description, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address: description });
      const address = results?.[0]?.address_components || [];

      const street = address.find((c) => c.types.includes('route'))?.long_name || '';
      const city = address.find((c) => c.types.includes('locality'))?.long_name || '';
      const postalCode = address.find((c) => c.types.includes('postal_code'))?.long_name || '';
      const voivodeship =
        address.find((c) => c.types.includes('administrative_area_level_1'))?.long_name || '';

      if (!city || !postalCode) {
        setError(t('address.missingParts') || 'Nie udało się pobrać pełnego adresu.');
        toast.error(t('address.toast.missingParts') || 'Brak niektórych danych adresowych!');
      }

      onAddressSelected({ street, city, postalCode, voivodeship });
      toast.success(t('address.toast.selected') || 'Adres wybrany.');
    } catch (e) {
      if (process?.env?.NODE_ENV !== 'production') console.error(e);
      setError(t('address.fetchError') || 'Błąd przy pobieraniu danych adresowych.');
      toast.error(t('address.toast.fetchError') || 'Nie udało się pobrać adresu!');
    }
  };

  const onKeyDown = (e) => {
    if (status !== 'OK' || !data?.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % data.length);
      scrollIntoView(activeIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + data.length) % data.length);
      scrollIntoView(activeIndex - 1);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        pickSuggestion(data[activeIndex]?.description);
      }
    } else if (e.key === 'Escape') {
      clearSuggestions();
      setActiveIndex(-1);
    }
  };

  const scrollIntoView = (i) => {
    const el = listRef.current?.children?.[((i % data.length) + data.length) % data.length];
    el?.scrollIntoView?.({ block: 'nearest' });
  };

  const listboxId = 'address-suggestions';

  return (
    <div className={clsx('relative w-full', theme?.addressInputContainer)}>
      <input
        role="combobox"                          // pozwala na aria-expanded
        aria-haspopup="listbox"
        aria-expanded={status === 'OK'}
        aria-controls={listboxId}
        aria-autocomplete="list"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError('');
          setActiveIndex(-1);
        }}
        onKeyDown={onKeyDown}
        disabled={!ready}
        placeholder={t('address.placeholder') || 'Wpisz ulicę, miasto...'}
        className={clsx(
          'w-full p-3 border rounded-lg outline-none transition focus:ring-2',
          error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500',
          theme?.input,            // ✅ FAZA 9: styl pola z motywu
          theme?.inputFocus        // opcjonalne klasy focus z motywu
        )}
      />

      {error && (
        <p className={clsx('text-xs mt-1', theme?.errorText || 'text-red-500')}>
          {error}
        </p>
      )}

      {status === 'OK' && (
        <ul
          id={listboxId}
          role="listbox"
          ref={listRef}
          className={clsx(
            'absolute w-full z-10 mt-2 max-h-56 overflow-auto rounded-lg border shadow-lg',
            'bg-white',                              // domyślny fallback
            theme?.dropdown || theme?.dropdownBg,    // ✅ FAZA 9: tło dropdownu
            theme?.dropdownBorder                    // opcjonalny border z motywu
          )}
        >
          {data.map(({ place_id, description }, idx) => (
            <li
              key={place_id}
              role="option"
              tabIndex={0}                            // focusable
              aria-selected={activeIndex === idx}
              onMouseDown={(e) => e.preventDefault()} // nie gubimy focusu
              onClick={() => pickSuggestion(description)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pickSuggestion(description);
                }
              }}
              className={clsx(
                'p-2 cursor-pointer',
                activeIndex === idx
                  ? (theme?.dropdownItemActive || 'bg-blue-100')
                  : (theme?.dropdownItemHover || 'hover:bg-blue-50'),
                theme?.dropdownItem                  // ✅ FAZA 9: styl pozycji
              )}
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

AddressInput.propTypes = {
  onAddressSelected: PropTypes.func.isRequired,
};

export default AddressInput;

// ✅ FAZA 1: tłumaczenia (placeholder + toasty/komunikaty)
// ✅ FAZA 9: pełne podpięcie motywu (container, input, dropdown, pozycje, error text)
// ✅ FAZA 10: obsługa błędów (try/catch + toasty)
// ✅ FAZA 12: dostępność i statusy (combobox/listbox/option, keyboard, focus)
