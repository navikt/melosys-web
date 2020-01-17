import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './knapp.css';

const Knapp = ({
  ikon,
  children,
  htmlType,
  type,
  ...rest
}) => (
  <Nav.Knapp htmlType={htmlType} type={type} {...rest} >
    {
      ikon && <img src={ikon} height={20} alt={ikon} className="ikon" />
    }
    {children}
  </Nav.Knapp>
);

Knapp.propTypes = {
  ikon: PT.string,
  children: PT.node,
  htmlType: PT.oneOf(['submit', 'button', 'reset']),
  type: PT.oneOf(['standard', 'hoved', 'fare', 'flat']),
};

Knapp.defaultProps = {
  ikon: undefined,
  children: undefined,
  htmlType: 'button',
  type: 'standard',
};

export default Knapp;
