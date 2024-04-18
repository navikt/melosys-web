import { ComponentProps } from "react";

import * as Nav from "../../navFrontend";
import Knapperad from "../knapperad";

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
        <Knapperad
          bekreft={slettVedlegg}
          bekreftTekst="Ja, slett"
          avbryt={onRequestClose}
          avbrytTekst="Avbryt"
          redigerbart
          size="small"
        />
      </Nav.Row>
    </Nav.Modal>
  );
};

export default SlettFritekstvedleggModal;
