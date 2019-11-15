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

export const Elementskrift = ({
  ikon,
  tekst,
  className,
}) => (
  <Nav.Element className={className}>
    <img src={ikon} height={20} alt={tekst} />{tekst}
  </Nav.Element>
);

Elementskrift.propTypes = {
  ikon: PT.any.isRequired,
  tekst: PT.string.isRequired,
  className: PT.string,
};
Elementskrift.defaultProps = {
  className: undefined,
};
