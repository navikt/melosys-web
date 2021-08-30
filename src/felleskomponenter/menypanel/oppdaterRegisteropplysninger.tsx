import React, { KeyboardEvent } from "react";

import "./oppdaterRegisteropplysninger.css";
import * as Nav from "../../utils/navFrontend";
import { Refresh } from "../../resources/images";

type OppdaterRegisteroppslysningerProps = {
  sistOppdatert: string;
  oppdaterRegisteropplysninger: () => void;
};

export const OppdaterRegisteropplysninger = ({
  sistOppdatert,
  oppdaterRegisteropplysninger,
}: OppdaterRegisteroppslysningerProps) => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      oppdaterRegisteropplysninger();
    }
  };

  return (
    <Nav.Panel className="oppdater-registeropplysninger" border>
      <span>{` (sist oppdatert ${sistOppdatert})`}</span>
      <span
        className="oppdater-registeropplysninger__oppdateringsknapp"
        role="button"
        tabIndex={0}
        onClick={oppdaterRegisteropplysninger}
        onKeyPress={handleKeyPress}
        onKeyUp={handleKeyPress}
      >
        <Refresh />
        Oppdater registeropplysninger
      </span>
    </Nav.Panel>
  );
};

export default OppdaterRegisteropplysninger;
