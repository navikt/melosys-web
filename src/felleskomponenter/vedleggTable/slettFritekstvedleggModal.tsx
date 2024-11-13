import * as Nav from "../../navFrontend";
import Knapperad from "../knapperad";

interface SlettFritekstvedleggModalProps {
  open: boolean;
  lukkModal: () => void;
  slettVedlegg: () => void;
}

const SlettFritekstvedleggModal = ({ open, lukkModal, slettVedlegg }: SlettFritekstvedleggModalProps) => {
  return (
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
};

export default SlettFritekstvedleggModal;
