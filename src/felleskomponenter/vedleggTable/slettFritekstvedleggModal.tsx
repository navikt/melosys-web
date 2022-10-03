import React, { ComponentProps } from "react";

import * as Nav from "../../navFrontend";

Nav.Modal.setAppElement(document.getElementById("root"));

interface SlettFritekstvedleggModalProps {
  onRequestClose: ComponentProps<typeof Nav.Modal>["onRequestClose"];
  ariaHideApp?: boolean;
  slettVedlegg: () => void;
}

const SlettFritekstvedleggModal = ({
  onRequestClose,
  ariaHideApp = true,
  slettVedlegg,
}: SlettFritekstvedleggModalProps) => {
  return (
    <Nav.Modal
      className="slettfritekstvedlegg-modal"
      contentLabel="Slett fritekstvedlegg?"
      isOpen
      shouldCloseOnOverlayClick
      onRequestClose={onRequestClose}
      // @ts-ignore
      ariaHideApp={ariaHideApp}
    >
      <Nav.Row>
        <Nav.Typo.Element>Slett fritekstvedlegg?</Nav.Typo.Element>
        <Nav.Typo.Normaltekst>
          Er du sikker på at du vil slette fritekstvedlegget?
          <br /> Dokumentet vil bli permanent slettet fra Melosys
        </Nav.Typo.Normaltekst>
      </Nav.Row>
      <Nav.Row>
        <Nav.Hovedknapp mini onClick={slettVedlegg}>
          Ja, slett
        </Nav.Hovedknapp>
        <Nav.Knapp mini type="flat" onClick={onRequestClose}>
          Avbryt
        </Nav.Knapp>
      </Nav.Row>
    </Nav.Modal>
  );
};

export default SlettFritekstvedleggModal;
