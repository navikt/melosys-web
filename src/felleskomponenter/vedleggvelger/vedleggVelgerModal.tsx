import { FysiskDokument } from "Domene";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";
import VedleggVelgerTable from "./vedleggVelgerTable";
import "./vedleggVelger.css";

interface VedleggVelgerModalProps {
  onRequestClose: () => void;
  valgteVedlegg: FysiskDokument[];
  alleVedlegg: FysiskDokument[];
  slettVedlegg: (vedleggID: string) => void;
  leggTilVedlegg: (vedlegg: FysiskDokument) => void;
}

function VedleggVelgerModal({
  onRequestClose,
  valgteVedlegg,
  alleVedlegg,
  leggTilVedlegg,
  slettVedlegg,
}: VedleggVelgerModalProps) {
  const harDokumenter = !Utils._isEmpty(alleVedlegg);
  return (
    <Nav.Modal
      className="vedleggvelger-modal"
      onClose={onRequestClose}
      open
      closeOnBackdropClick
      header={{ heading: "Dokumenter tilknyttet saken", closeButton: false }}
      width={harDokumenter ? undefined : 500}
    >
      <Nav.Modal.Body>
        {harDokumenter ? (
          <VedleggVelgerTable
            valgteVedlegg={valgteVedlegg}
            alleVedlegg={alleVedlegg}
            leggTilVedlegg={leggTilVedlegg}
            slettVedlegg={slettVedlegg}
          />
        ) : (
          <span>Fant ingen dokumenter tilknyttet saken</span>
        )}
      </Nav.Modal.Body>
      <Nav.Modal.Footer>
        <Nav.Button variant="primary" onClick={onRequestClose}>
          Lukk
        </Nav.Button>
      </Nav.Modal.Footer>
    </Nav.Modal>
  );
}

export default VedleggVelgerModal;
