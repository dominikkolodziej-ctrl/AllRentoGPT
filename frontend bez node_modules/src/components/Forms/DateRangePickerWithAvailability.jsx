import React from 'react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { eachDayOfInterval, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { getOfferAvailability } from '@/api/availabilityApi'; // ✅ FAZA 8 – poprawna kolejność

export default function DateRangePickerWithAvailability({ offerId, value, onChange }) {
  const [disabledDays, setDisabledDays] = useState([]);

  useEffect(() => {
    async function loadAvailability() {
      try {
        const { unavailableDates } = await getOfferAvailability(offerId);
        const parsed = unavailableDates.map((d) => parseISO(d));
        setDisabledDays(parsed);
      } catch {
        toast.error('Nie udało się pobrać dostępności');
      }
    }
    loadAvailability();
  }, [offerId]);

  const handleSelect = (range) => {
    if (!range?.from || !range?.to) return;
    const days = eachDayOfInterval({ start: range.from, end: range.to });
    const conflict = days.some((d) =>
      disabledDays.find((dd) => dd.toDateString() === d.toDateString())
    );
    if (conflict) {
      toast.error('Wybrany termin zawiera niedostępne dni');
      return;
    }
    onChange({ start: range.from, end: range.to });
  };

  return (
    <div>
      <DayPicker
        mode="range"
        selected={value?.start && value?.end ? { from: value.start, to: value.end } : undefined}
        onSelect={handleSelect}
        disabled={disabledDays}
        modifiers={{ unavailable: disabledDays }}
        numberOfMonths={2}
        fromDate={new Date()}
      />

      {value?.start && value?.end && (
        <p className="text-sm mt-2">
          Wybrano: <strong>{value.start.toLocaleDateString()}</strong> – <strong>{value.end.toLocaleDateString()}</strong>
        </p>
      )}
    </div>
  );
}

DateRangePickerWithAvailability.propTypes = {
  offerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.shape({
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date)
  }),
  onChange: PropTypes.func.isRequired
};
