import React from 'react';
import PT from 'prop-types';

import { getSvgPath } from './resources';


const MelosysIkon = ({ kind, size }) => {
  const path = getSvgPath(kind);

  return (
    <img
      src={path}
      alt={kind}
      width={size}
      height={size}
    />
  );
};

MelosysIkon.propTypes = {
  kind: PT.oneOf([
    'tilsette',
    'minus',
  ]).isRequired,
  size: PT.oneOfType([PT.number, PT.string]),
};

MelosysIkon.defaultProps = {
  size: '20',
};

export default MelosysIkon;
