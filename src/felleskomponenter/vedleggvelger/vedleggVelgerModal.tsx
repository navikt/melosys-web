import { FysiskDokument } from "Domene";
import * as Nav from "../../navFrontend";
import * as DokumenterV2 from "../../services/modules/dokumenter-v2";
import "./vedleggVelger.css";
import VedleggVelgerTable from "./vedleggVelgerTable";

interface VedleggVelgerModalProps {
  onRequestClose: () => void;
  valgteVedlegg: DokumenterV2.BrevVedleggInterface;
  alleSaksvedlegg: DokumenterV2.FysiskDokument[];
  slettSaksvedlegg: (vedlegg: FysiskDokument) => void;
  slettStandardvedlegg: () => void;
  leggTilSaksvedlegg: (vedlegg: FysiskDokument) => void;
  velgStandardvedlegg: (vedlegg: DokumenterV2.TilgjengeligStandardvedlegg) => void;
  standardvedlegg: DokumenterV2.TilgjengeligStandardvedlegg[];
}

function VedleggVelgerModal({
  onRequestClose,
  valgteVedlegg,
  alleSaksvedlegg,
  leggTilSaksvedlegg,
  velgStandardvedlegg,
  slettSaksvedlegg,
  slettStandardvedlegg,
  standardvedlegg,
}: VedleggVelgerModalProps) {
  return (
    <Nav.Modal
      className="vedleggvelger-modal"
      onClose={onRequestClose}
      open
      closeOnBackdropClick
      header={{ heading: "Dokumenter tilknyttet saken", closeButton: false }}
    >
      <Nav.Modal.Body>
        <VedleggVelgerTable
          valgteVedlegg={valgteVedlegg}
          alleSaksvedlegg={alleSaksvedlegg}
          standardvedlegg={standardvedlegg}
          leggTilSaksvedlegg={leggTilSaksvedlegg}
          velgStandardvedlegg={velgStandardvedlegg}
          slettSaksvedlegg={slettSaksvedlegg}
          slettStandardvedlegg={slettStandardvedlegg}
        />
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
