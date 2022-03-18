import React, { KeyboardEvent } from "react";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";

import "./feilmeldingDialog.css";
import Valideringsfeil, { ValideringType } from "./Valideringsfeil";

interface Feilmelding {
  tittel: string;
  innhold: string;
}

export const ModalBody = ({ tittel, innhold }: Feilmelding) => (
  <div className="validering">
    <Nav.Typo.Element className="valideringKode">{tittel}</Nav.Typo.Element>
    <Nav.Tekstomrade>{innhold}</Nav.Tekstomrade>
  </div>
);

interface FeilmeldingDialogProps {
  avbryt: () => void;
  feilmeldinger: Feilmelding[];
  valideringer: ValideringType[];
}

export const FeilmeldingDialog = ({ avbryt, feilmeldinger, valideringer }: FeilmeldingDialogProps) => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      avbryt();
    }
  };

  const feilmeldingerInnhold = feilmeldinger.map((feilmelding) => (
    <ModalBody tittel={feilmelding.tittel} innhold={feilmelding.innhold} key={Utils._uuid()} />
  ));

  const valideringerInnhold = valideringer.map((validering) => (
    <Valideringsfeil validering={validering} key={validering.kode} />
  ));

  const innhold = valideringer.length > 0 ? valideringerInnhold : feilmeldingerInnhold;

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
      {innhold}
    </Nav.Modal>
  );
};

export default FeilmeldingDialog;
