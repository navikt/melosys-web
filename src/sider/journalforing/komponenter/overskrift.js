import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';

export const Overskrift = ({
  ikon,
  tekst,
  className,
}) => (
  <Nav.typo.Undertittel className={className}>
    <img src={ikon} height={25} alt={tekst} />{tekst}
  </Nav.typo.Undertittel>
);

Overskrift.propTypes = {
  ikon: PT.any.isRequired,
  tekst: PT.string.isRequired,
  className: PT.string,
};

Overskrift.defaultProps = {
  className: undefined,
};
