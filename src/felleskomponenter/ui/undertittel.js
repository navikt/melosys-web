import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './undertittel.css';

const Undertittel = ({
  ikon,
  tekst,
  className,
}) => (
  <Nav.typo.Undertittel className={className}>
    {
      ikon &&
      <img src={ikon} height={25} alt={tekst} />
    }
    {tekst}
  </Nav.typo.Undertittel>
);

Undertittel.propTypes = {
  ikon: PT.any.isRequired,
  tekst: PT.string.isRequired,
  className: PT.string,
};

Undertittel.defaultProps = {
  className: undefined,
};

export default Undertittel;
