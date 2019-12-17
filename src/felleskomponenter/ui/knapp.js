import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './knapp.css';

const Knapp = ({
  ikon,
  children,
  htmlType,
  ...rest
}) => (
  <Nav.Knapp htmlType={htmlType} {...rest} >
    {
      ikon && <img src={ikon} height={20} alt={ikon} className="ikon" />
    }
    {children}
  </Nav.Knapp>
);

Knapp.propTypes = {
  ikon: PT.string,
  children: PT.node,
  htmlType: PT.string,
};

Knapp.defaultProps = {
  ikon: undefined,
  children: undefined,
  htmlType: 'button',
};

export default Knapp;
