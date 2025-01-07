import { ElementType, MouseEventHandler } from "react";
import classnames from "classnames";
import * as Nav from "../../navFrontend";

import "./ikonKnapp.css";

interface IkonKnappProps {
  ikon: ElementType;
  onClick: MouseEventHandler<HTMLButtonElement>;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}

function IkonKnapp({ ikon: Ikon, onClick, ariaLabel, className, disabled }: IkonKnappProps) {
  const cls = classnames("ikon-knapp", className);

  return (
    <Nav.Button
      type="button"
      variant="tertiary"
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cls}
      disabled={disabled}
      onClick={onClick}
      icon={<Ikon className="ikon" />}
    />
  );
}

export default IkonKnapp;
