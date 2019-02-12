import React from 'react';
import PT from 'prop-types';

import { getSvg } from './resources';


const MelosysIkon = ({ kind, size }) => {
  const svg = getSvg(kind, size);

  return (
    <div>
      {svg}
    </div>
  );
};

MelosysIkon.propTypes = {
  kind: PT.oneOf([
    'tilsette',
    'minus',
  ]).isRequired,
  size: PT.oneOfType([PT.number, PT.string]),
  alt: PT.string,
};

MelosysIkon.defaultProps = {
  size: '24',
  alt: undefined,
};

export default MelosysIkon;
