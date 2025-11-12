// src/pages/dashboard/client/Timeline.jsx
import PropTypes from 'prop-types';
import React from 'react';
import ContractSender from '@/pages/contracts/ContractSender.jsx';

// Tymczasowe dane — do podpięcia z API
const dummyReservations = [];
const dummyTemplates = [];
const handleSubmit = () => {};

const statusLabels = {
  oczekuje: 'Oczekuje',
  potwierdzona: 'Potwierdzona',
  gotowa: 'Gotowa do odbioru',
  zakonczona: 'Zakończona',
  anulowana: 'Anulowana',
};

const statusSteps = ['oczekuje', 'potwierdzona', 'gotowa', 'zakonczona'];

export const ReservationStatusTimeline = ({ status }) => {
  const currentIdx = statusSteps.indexOf(status);

  return (
    <>
      <ContractSender
        reservations={dummyReservations}
        templates={dummyTemplates}
        onSubmit={handleSubmit}
        isOpen={true}
      />

      <ol
        className="flex items-center justify-between w-full max-w-xl mx-auto py-4"
        aria-label="Oś postępu rezerwacji"
      >
        {statusSteps.map((step, idx) => {
          const isActive = currentIdx >= idx;
          const isCurrent = currentIdx === idx;
          return (
            <li
              key={step}
              className="flex flex-col items-center text-center w-full"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div
                className={`rounded-full w-6 h-6 border-2 mb-2 ${
                  isActive ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}
              />
              <span
                className={`text-xs ${isActive ? 'text-green-600 font-semibold' : 'text-gray-400'}`}
              >
                {statusLabels[step]}
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
};

ReservationStatusTimeline.propTypes = {
  status: PropTypes.oneOf(statusSteps).isRequired,
};

const Timeline = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Postęp rezerwacji</h2>
    <ReservationStatusTimeline status="potwierdzona" />
  </div>
);

export default Timeline;
