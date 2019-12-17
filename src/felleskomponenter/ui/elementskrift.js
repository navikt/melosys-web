import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './elementskrift.css';

const Elementskrift = ({
  ikon,
  tekst,
  className,
}) => (
  <Nav.typo.Element className={className}>
    <img src={ikon} height={20} alt={tekst} />{tekst}
  </Nav.typo.Element>
);

Elementskrift.propTypes = {
  ikon: PT.any.isRequired,
  tekst: PT.string.isRequired,
  className: PT.string,
};
Elementskrift.defaultProps = {
  className: undefined,
};

export default Elementskrift;
