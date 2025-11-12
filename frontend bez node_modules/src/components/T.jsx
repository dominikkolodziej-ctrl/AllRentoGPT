import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
// src/components/T.jsx
import { useTranslate } from '@/hooks/useTranslate.js';

const T = ({ k, data, as, className = '', html = false, children = null }) => {
  const { t } = useTranslate();

  const value = useMemo(() => {
    try {
      return t(k, data);
    } catch {
      return '';
    }
  }, [t, k, data]);

  const Tag = as || (className || html ? 'span' : React.Fragment);

  if (html) {
    return (
      <Tag
        className={className}
        dangerouslySetInnerHTML={{ __html: value || children || k }}
      />
    );
  }

  return <Tag className={className}>{value || children || k}</Tag>;
};

T.displayName = 'T';

T.propTypes = {
  k: PropTypes.string.isRequired,
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string, PropTypes.number, PropTypes.bool]),
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
  className: PropTypes.string,
  html: PropTypes.bool,
  children: PropTypes.node,
};

export { T };
export default memo(T);
