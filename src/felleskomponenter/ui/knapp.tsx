import React from 'react';
import PT from 'prop-types';
import { KnappBaseProps } from 'nav-frontend-knapper';

import * as Nav from '../../utils/navFrontend';

import './knapp.css';

type KnappProps = KnappBaseProps & { ikon?: React.ElementType };

const Knapp = ({
  ikon: Ikon,
  children,
  htmlType,
  type,
  disabled,
  ...rest
}: KnappProps) => {
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
        Ikon && <Ikon className="ikon" />
      }
      {children}
    </Nav.Knapp>
  );
};

Knapp.propTypes = {
  ikon: PT.elementType,
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
