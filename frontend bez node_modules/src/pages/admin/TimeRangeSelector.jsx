import React from 'react';
import PropTypes from 'prop-types';

const presets = [
  { label: 'Dziś', value: 'today' },
  { label: 'Wczoraj', value: 'yesterday' },
  { label: 'Ostatnie 7 dni', value: 'last7' },
  { label: 'Ostatnie 30 dni', value: 'last30' },
  { label: 'Ten miesiąc', value: 'thisMonth' },
  { label: 'Poprzedni miesiąc', value: 'lastMonth' },
  { label: 'Ten kwartał', value: 'thisQuarter' },
  { label: 'Poprzedni kwartał', value: 'lastQuarter' },
  { label: 'Ten rok', value: 'thisYear' },
  { label: 'Poprzedni rok', value: 'lastYear' },
];

export default function TimeRangeSelector({ range, setRange }) {
  const handlePreset = (val) => setRange({ preset: val, from: '', to: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRange((prev) => ({ ...prev, [name]: value, preset: '' }));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Zakres czasu - presety">
        {presets.map((p) => (
          <button
            key={p.value}
            type="button"
            className={`btn btn-sm ${range.preset === p.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handlePreset(p.value)}
            aria-pressed={range.preset === p.value}
            aria-label={`Zakres: ${p.label}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <label className="label" htmlFor="range-from">
            <span className="label-text">Data od</span>
          </label>
          <input
            id="range-from"
            type="date"
            name="from"
            className="input input-bordered w-full"
            value={range.from}
            onChange={handleChange}
            aria-label="Data od"
          />
        </div>
        <div>
          <label className="label" htmlFor="range-to">
            <span className="label-text">Data do</span>
          </label>
          <input
            id="range-to"
            type="date"
            name="to"
            className="input input-bordered w-full"
            value={range.to}
            onChange={handleChange}
            aria-label="Data do"
          />
        </div>
      </div>
    </div>
  );
}

TimeRangeSelector.propTypes = {
  range: PropTypes.shape({
    preset: PropTypes.string,
    from: PropTypes.string,
    to: PropTypes.string,
  }).isRequired,
  setRange: PropTypes.func.isRequired,
};
