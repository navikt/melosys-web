import { ChangeEvent, KeyboardEvent, useState } from "react";

import "./oppdaterRegisteropplysninger.css";
import * as Nav from "../../navFrontend";
import { Refresh } from "../../resources/images";

type OppdaterRegisteroppslysningerProps = {
  sistOppdatert: string;
  oppdaterRegisteropplysninger: (isSiste5aar: boolean) => void;
};

export const OppdaterRegisteropplysninger = ({
  sistOppdatert,
  oppdaterRegisteropplysninger,
}: OppdaterRegisteroppslysningerProps) => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      oppdaterRegisteropplysninger(inkluderSiste5aar);
    }
  };
  const [inkluderSiste5aar, setInkluderSiste5aarVarslet] = useState(false);
  const checkboxChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setInkluderSiste5aarVarslet(true);
    } else {
      setInkluderSiste5aarVarslet(false);
    }
  };

  return (
    <Nav.Panel className="oppdater-registeropplysninger" border>
      <Nav.Checkbox
        className={"oppdater-registeropplysninger__checkbox"}
        name="InkluderSiste5aar"
        checked={inkluderSiste5aar}
        onChange={checkboxChangeHandler}
        label="Inkl siste 5 år"
      />
      <span
        className="oppdater-registeropplysninger__oppdateringsknapp"
        role="button"
        tabIndex={0}
        onClick={() => oppdaterRegisteropplysninger(inkluderSiste5aar)}
        onKeyPress={handleKeyPress}
      >
        <Refresh />
        Oppdater registeropplysninger
      </span>
      <span className="oppdater-registeropplysninger__sistOppdatert">
        {` (sist oppdatert ${sistOppdatert || "- "})`}
      </span>
    </Nav.Panel>
  );
};

export default OppdaterRegisteropplysninger;
