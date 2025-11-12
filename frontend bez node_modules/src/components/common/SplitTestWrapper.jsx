import PropTypes from 'prop-types';
import { useExperiment } from '@/hooks/useExperiment.js';

const SplitTestWrapper = ({ experiment, A, B }) => {
  const variant = useExperiment(experiment);
  return variant === 'A' ? A : B;
};

SplitTestWrapper.propTypes = {
  experiment: PropTypes.string.isRequired,
  A: PropTypes.node,
  B: PropTypes.node,
};

export default SplitTestWrapper;
