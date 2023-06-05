import React from "react";
import { KnappBaseProps } from "nav-frontend-knapper";
import classnames from "classnames";

import * as Nav from "../../navFrontend";

import "./knapp.css";

type KnappProps = KnappBaseProps & {
  ikon?: React.ElementType;
  capitalCase?: boolean;
  noTextTransform?: boolean;
};

const Knapp = ({
  ikon: Ikon,
  children,
  htmlType,
  type,
  disabled,
  capitalCase,
  noTextTransform,
  className,
  ...rest
}: KnappProps) => {
  const cls = classnames("mui-knapp", className, {
    disabledKnapp: disabled,
    knapp: !disabled,
    capitalCase,
    noTextTransform,
  });

  return (
    <Nav.Knapp htmlType={htmlType} type={type} className={cls} disabled={disabled} {...rest}>
      {Ikon && <Ikon className="ikon" />}
      {children}
    </Nav.Knapp>
  );
};

export default Knapp;
