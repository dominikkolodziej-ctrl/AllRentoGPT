import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const TextBlock = ({ title, description }) => (
  <div className={clsx("space-y-2")}>
    <h3 className="text-lg font-bold">{title}</h3>
    <p>{description}</p>
  </div>
);

TextBlock.propTypes = {
  title: PropTypes.any,
  description: PropTypes.any,
};

export default TextBlock;
