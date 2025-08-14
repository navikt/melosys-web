import { createPortal } from "react-dom";
import * as Nav from "../../navFrontend";
import Knapperad from "../knapperad";

interface SlettFritekstvedleggModalProps {
  open: boolean;
  lukkModal: () => void;
  slettVedlegg: () => void;
}

function SlettFritekstvedleggModal({ open, lukkModal, slettVedlegg }: SlettFritekstvedleggModalProps) {
  const modalContent = (
    <Nav.Modal
      onClose={lukkModal}
      open={open}
      header={{ heading: "Slett fritekstvedlegg?", closeButton: false }}
      closeOnBackdropClick
    >
      <Nav.Modal.Body>
        <Nav.BodyLong size="small">
          Er du sikker på at du vil slette fritekstvedlegget?
          <br /> Dokumentet vil bli permanent slettet fra Melosys
        </Nav.BodyLong>
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Knapperad
          bekreft={() => {
            slettVedlegg();
            lukkModal();
          }}
          bekreftTekst="Ja, slett"
          avbryt={lukkModal}
          avbrytTekst="Avbryt"
          redigerbart
        />
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
  return createPortal(modalContent, document.body);
}

export default SlettFritekstvedleggModal;
