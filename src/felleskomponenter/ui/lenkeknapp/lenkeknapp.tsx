/**
 * @deprecated Erstattes med Aksel Button (variant tertiary + icon prop)
 */

import { ElementType, MouseEventHandler, ReactNode } from "react";
import * as Nav from "../../../navFrontend";

interface LenkeknappProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
  className?: string;
  ikon?: ElementType;
  value?: string;
  disabled?: boolean;
}

function Lenkeknapp({ onClick, children, className, ikon: Ikon, value, disabled }: LenkeknappProps) {
  return (
    <Nav.Button
      type="button"
      icon={Ikon && <Ikon className="ikon" />}
      onClick={onClick}
      className={className}
      value={value}
      disabled={disabled}
      variant="tertiary"
    >
      {children}
    </Nav.Button>
  );
}

export default Lenkeknapp;
