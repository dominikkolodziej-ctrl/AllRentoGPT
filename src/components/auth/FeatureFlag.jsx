import PropTypes from 'prop-types';
import { useUserPlan } from "@/hooks/useUserPlan.js";

const FeatureFlag = ({ flag, children }) => {
  const { features } = useUserPlan();
  return features.includes(flag) ? children : null;
};

FeatureFlag.propTypes = {
  flag: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default FeatureFlag;
