import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { eachDayOfInterval, format, isToday } from 'date-fns';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

// src/components/AvailabilityCalendar.jsx
export const AvailabilityCalendar = ({ start, end, availabilityMap = {}, onSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const { theme } = useTheme() || {};
  const { t } = useLiveText?.() || { t: (k) => k };

  const days = eachDayOfInterval({ start, end });

  const handleSelect = (day) => {
    setSelectedDate(day);
    if (typeof onSelect === 'function') onSelect(day);
  };

  return (
    <div className="grid grid-cols-7 gap-2 p-4 border rounded">
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const available = availabilityMap?.[key] ?? false;
        const selected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === key;

        const base =
          'p-2 text-sm border rounded text-center transition-all focus:outline-none focus:ring-2';
        const clsAvailable =
          theme?.calendar?.available ||
          'bg-green-100 hover:bg-green-200 text-green-900';
        const clsUnavailable =
          theme?.calendar?.unavailable || 'bg-gray-200 text-gray-500';
        const clsToday = theme?.calendar?.todayBorder || 'border-blue-500';
        const clsSelected = theme?.calendar?.selectedRing || 'ring-2 ring-blue-600';

        return (
          <button
            key={key}
            type="button"
            onClick={() => handleSelect(day)}
            aria-pressed={!!selected}
            aria-label={`${format(day, 'dd.MM.yyyy')} • ${
              available
                ? t('calendar.available') || 'Dostępny'
                : t('calendar.unavailable') || 'Niedostępny'
            }`}
            className={[
              base,
              available ? clsAvailable : clsUnavailable,
              isToday(day) ? clsToday : '',
              selected ? clsSelected : '',
            ].join(' ')}
          >
            {format(day, 'dd.MM')}
          </button>
        );
      })}
    </div>
  );
};

AvailabilityCalendar.propTypes = {
  start: PropTypes.instanceOf(Date).isRequired,
  end: PropTypes.instanceOf(Date).isRequired,
  availabilityMap: PropTypes.objectOf(PropTypes.bool),
  onSelect: PropTypes.func,
};

export default AvailabilityCalendar;

// ✅ FAZA 1: tłumaczenia mikro‑etykiet (t('calendar.available/unavailable'))
// ✅ FAZA 9: pełne wsparcie motywu (theme.calendar.available/unavailable/todayBorder/selectedRing)
// ✅ FAZA 12: dostępność (aria-pressed, aria-label) i focus ring
