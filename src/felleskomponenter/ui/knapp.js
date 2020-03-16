import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../utils/navFrontend';

import './knapp.css';

const Knapp = ({
  ikon,
  children,
  htmlType,
  type,
  disabled,
  ...rest
}) => {
  const knappClassname = disabled ? 'disabledKnapp' : 'knapp';

  return (
    <Nav.Knapp
      htmlType={htmlType}
      type={type}
      className={knappClassname}
      disabled={disabled}
      {...rest}
    >
      {
        ikon && <img src={ikon} height={20} alt={ikon} className="ikon" />
      }
      {children}
    </Nav.Knapp>
  );
};

Knapp.propTypes = {
  ikon: PT.string,
  children: PT.node,
  htmlType: PT.oneOf(['submit', 'button', 'reset']),
  type: PT.oneOf(['standard', 'hoved', 'fare', 'flat']),
  disabled: PT.bool,
};

Knapp.defaultProps = {
  ikon: undefined,
  children: undefined,
  htmlType: 'button',
  type: 'standard',
  disabled: false,
};

export default Knapp;
