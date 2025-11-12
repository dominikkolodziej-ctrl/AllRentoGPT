import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { defaultRadius } from '@/utils/constants.js';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 WDROŻONA
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 12 WDROŻONA

const SearchBar = ({ onLocationSelect, className = '' }) => {
  const inputRef = useRef(null);
  const listenerRef = useRef(null);
  const [address, setAddress] = useState('');
  const [radius] = useState(defaultRadius || 10);

  const { t } = useLiveText();
  const { theme } = useTheme();

  useEffect(() => {
    let pollId = null;

    const init = () => {
      if (!window.google?.maps?.places || !inputRef.current) return false;

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'pl' },
      });

      listenerRef.current = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place?.geometry?.location) {
          toast.error(t('maps.noLocation') || 'Nie można uzyskać lokalizacji.');
          return;
        }

        const payload = {
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          radius,
        };

        setAddress(place.formatted_address || '');
        onLocationSelect?.(payload); // TODO [FAZA 9: emit analytics event 'location_selected' z radius]
        // TODO [FAZA 8: po wyborze lokalizacji pobierz oferty w promieniu radius]
      });

      return true;
    };

    if (!init()) {
      pollId = window.setInterval(() => {
        if (init()) {
          window.clearInterval(pollId);
          pollId = null;
        }
      }, 100);
    }

    return () => {
      if (pollId) window.clearInterval(pollId);
      if (listenerRef.current && window.google?.maps?.event?.removeListener) {
        window.google.maps.event.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, [radius, onLocationSelect, t]);

  const inputId = 'searchbar-location';

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-gray-600">
        {t('search.location.label') || 'Wyszukaj lokalizację'}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          placeholder={t('search.location.placeholder') || 'Np. Warszawa, Gdańsk, Katowice'}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={
            theme?.textInput ??
            'w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          }
          aria-label={t('search.location.label') || 'Wyszukaj lokalizację'}
          autoComplete="off"
          inputMode="search"
        />
        <MapPin className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" aria-hidden="true" />
      </div>
      <div className="text-xs text-gray-500">
        {(t('search.radius') || 'Promień wyszukiwania') + `: ${radius} km`}
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  onLocationSelect: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default memo(SearchBar);
