import React, { ElementType, MouseEventHandler } from "react";
import classNames from "classnames";

import "./lenkeknapp.css";

interface LenkeknappProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  className?: string;
  ikon?: ElementType;
}

const Lenkeknapp = ({ onClick, children, className, ikon: Ikon, ...rest }: LenkeknappProps) => {
  const cls = classNames(Ikon ? "lenkeknapp__ikon" : "lenkeknapp", className);

  return (
    <button {...rest} onClick={onClick} className={cls} type="button">
      {Ikon && <Ikon className="ikon" />}
      {children}
    </button>
  );
};

export default Lenkeknapp;
