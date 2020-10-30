import React from 'react';
import PT from 'prop-types';
import { KnappBaseProps } from 'nav-frontend-knapper';
import classnames from 'classnames';

import * as Nav from '../../utils/navFrontend';

import './knapp.css';

type KnappProps = KnappBaseProps & {
  ikon?: React.ElementType,
  capitalCase?: boolean,
};

const Knapp = ({
  ikon: Ikon,
  children,
  htmlType,
  type,
  disabled,
  capitalCase,
  className,
  ...rest
}: KnappProps) => {
  const cls = classnames(className, {
    disabledKnapp: disabled,
    knapp: !disabled,
    capitalCase,
  });

  return (
    <Nav.Knapp
      htmlType={htmlType}
      type={type}
      className={cls}
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
  capitalCase: PT.bool,
  className: PT.string,
  children: PT.node,
  htmlType: PT.oneOf(['submit', 'button', 'reset']),
  type: PT.oneOf(['standard', 'hoved', 'fare', 'flat']),
  disabled: PT.bool,
};

Knapp.defaultProps = {
  ikon: undefined,
  capitalCase: false,
  className: undefined,
  children: undefined,
  htmlType: 'button',
  type: 'standard',
  disabled: false,
};

export default Knapp;
