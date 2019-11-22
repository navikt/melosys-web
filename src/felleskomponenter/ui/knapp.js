import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './knapp.css';

const Knapp = ({
  ikon,
  children,
  ...rest
}) => (
  <Nav.Knapp {...rest} >
    <img src={ikon} height={20} alt={ikon} className="ikon" />
    {children}
  </Nav.Knapp>
);

Knapp.propTypes = {
  ikon: PT.string,
  children: PT.node,
};

Knapp.defaultProps = {
  ikon: undefined,
  children: undefined,
};

export default Knapp;
