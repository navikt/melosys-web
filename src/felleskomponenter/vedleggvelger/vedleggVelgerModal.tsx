import { ComponentProps } from "react";
import { FysiskDokument } from "Domene";

import * as Nav from "../../navFrontend";
import VedleggVelgerTable from "./vedleggVelgerTable";
import "./vedleggVelger.css";

Nav.Modal.setAppElement(document.getElementById("root"));

interface VedleggVelgerModalProps {
  onRequestClose: ComponentProps<typeof Nav.Modal>["onRequestClose"];
  contentLabel: ComponentProps<typeof Nav.Modal>["contentLabel"];
  ariaHideApp?: boolean;
  valgteVedlegg: FysiskDokument[];
  alleVedlegg: FysiskDokument[];
  slettVedlegg: (vedleggID: string) => void;
  leggTilVedlegg: (vedlegg: FysiskDokument) => void;
}

const VedleggVelgerModal = ({
  onRequestClose,
  contentLabel,
  ariaHideApp = true,
  valgteVedlegg,
  alleVedlegg,
  leggTilVedlegg,
  slettVedlegg,
}: VedleggVelgerModalProps) => {
  return (
    <Nav.Modal
      className="vedleggvelger-modal"
      contentLabel={contentLabel}
      isOpen
      shouldCloseOnOverlayClick
      closeButton
      onRequestClose={onRequestClose}
      ariaHideApp={ariaHideApp}
    >
      <Nav.Typo.Element>{contentLabel}</Nav.Typo.Element>
      <VedleggVelgerTable
        valgteVedlegg={valgteVedlegg}
        alleVedlegg={alleVedlegg}
        leggTilVedlegg={leggTilVedlegg}
        slettVedlegg={slettVedlegg}
      />
      <Nav.Hovedknapp onClick={onRequestClose}>Lukk</Nav.Hovedknapp>
    </Nav.Modal>
  );
};

export default VedleggVelgerModal;
