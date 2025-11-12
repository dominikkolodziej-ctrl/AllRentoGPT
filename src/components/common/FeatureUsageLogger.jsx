import PropTypes from 'prop-types';

const FeatureUsageLogger = ({ children }) => {
  return children;
};

FeatureUsageLogger.propTypes = {
  children: PropTypes.any,
};

export default FeatureUsageLogger;
