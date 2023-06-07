import React, { MouseEventHandler } from "react";
import classnames from "classnames";

import "./ikonKnapp.css";

type IkonKnappProps = {
  ikon: React.ElementType;
  onClick: MouseEventHandler<HTMLButtonElement>;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
};

const IkonKnapp = ({ ikon: Ikon, onClick, ariaLabel, className, disabled }: IkonKnappProps) => {
  const cls = classnames("ikon-knapp", className);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cls}
      disabled={disabled}
      onClick={onClick}
    >
      <Ikon className="ikon" />
    </button>
  );
};

export default IkonKnapp;
