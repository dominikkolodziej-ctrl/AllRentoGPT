import PropTypes from 'prop-types';
import clsx from 'clsx';
import React from 'react';

const FeatureList = ({ features = [] }) => (
  <ul className={clsx('list-disc pl-6 space-y-1')}>
    {features.map((f, i) => (
      <li key={`${f}-${i}`}>{f}</li>
    ))}
  </ul>
);

FeatureList.propTypes = {
  features: PropTypes.arrayOf(PropTypes.string),
};

export default FeatureList;

// ✅ FAZA 12 – mikro-status (bezpieczne renderowanie pustej listy, unikalne klucze)
