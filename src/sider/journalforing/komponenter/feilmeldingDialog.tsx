import React, { KeyboardEvent } from "react";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

import "./feilmeldingDialog.css";

interface Feilmelding {
  tittel: string;
  innhold: string;
}

interface FeilmeldingDialogProps {
  avbryt: () => void;
  feilmeldinger: Feilmelding[];
}

export const FeilmeldingDialog = ({ avbryt, feilmeldinger }: FeilmeldingDialogProps) => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      avbryt();
    }
  };

  return (
    <Nav.Modal
      className="feilmeldingDialog"
      isOpen
      contentLabel="Valideringsmeldinger"
      onRequestClose={avbryt}
      closeButton={false}
      shouldCloseOnOverlayClick
    >
      <span
        id="closeButton"
        tabIndex={0}
        role="button"
        onClick={avbryt}
        onKeyPress={handleKeyPress}
        onKeyUp={handleKeyPress}
      >
        &times;
      </span>
      {feilmeldinger.map((feilmelding) => (
        <div className="validering" key={Utils._uuid()}>
          <Nav.Typo.Element className="valideringKode">{feilmelding.tittel}</Nav.Typo.Element>
          <Nav.Tekstomrade>{feilmelding.innhold}</Nav.Tekstomrade>
        </div>
      ))}
    </Nav.Modal>
  );
};

export default FeilmeldingDialog;
