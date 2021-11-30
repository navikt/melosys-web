import React, { MouseEventHandler } from "react";
import classNames from "classnames";

import "./lenkeknapp.css";

interface LenkeknappProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string;
}

const Lenkeknapp = ({ onClick, children, className }: LenkeknappProps) => {
  const cls = classNames("lenkeknapp", className);

  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
};

export default Lenkeknapp;
