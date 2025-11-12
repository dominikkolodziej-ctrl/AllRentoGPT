import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const LocationInput = ({ defaultValue = '', onChange, onEvent, className = '' }) => {
  const { t } = useLiveText();
  const theme = useTheme();
  const classes = theme?.classes ?? {};
  const inputClass =
    classes.textInput ??
    'w-full p-3 border border-gray-300 rounded-lg shadow bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const inputRef = useRef(null);
  const listenerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let intervalId = null;

    const init = () => {
      if (!window.google?.maps?.places || !inputRef.current) return false;

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'pl' },
        fields: ['geometry', 'formatted_address'],
      });

      listenerRef.current = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place?.geometry) {
          const payload = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address,
          };
          onChangeRef.current?.(payload);
          onEvent?.('location_selected', payload);
          if (inputRef.current) inputRef.current.value = place.formatted_address ?? '';
        }
      });

      setIsReady(true);
      onEvent?.('location_autocomplete_ready');
      return true;
    };

    if (!init()) {
      intervalId = window.setInterval(() => {
        if (init()) {
          window.clearInterval(intervalId);
          intervalId = null;
        }
      }, 100);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      if (listenerRef.current && window.google?.maps?.event?.removeListener) {
        window.google.maps.event.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, [onEvent]);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={defaultValue}
      placeholder={isReady ? t('Wpisz lokalizację (np. Warszawa)') : t('Ładowanie lokalizacji...')}
      className={`${inputClass} ${className}`}
      aria-label={t('Pole wyszukiwania lokalizacji')}
      autoComplete="off"
      inputMode="search"
    />
  );
};

LocationInput.propTypes = {
  defaultValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default LocationInput;
