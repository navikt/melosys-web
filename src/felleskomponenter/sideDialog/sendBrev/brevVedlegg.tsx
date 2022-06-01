import React from "react";
import { ColumnWidth } from "nav-frontend-grid";
import { FysiskDokument } from "Domene";

import * as Nav from "../../../navFrontend";
import { DokumenterV2 } from "../../../services/api";
import VedleggVelger from "../../vedleggvelger";

interface BrevVedleggProps {
  felt: DokumenterV2.Felt;
  width: ColumnWidth;
  dokumenter: FysiskDokument[];
  valgteVedlegg: FysiskDokument[];
  setValgteVedlegg: (valgteVedlegg: FysiskDokument[]) => void;
}

const BrevVedlegg = ({ felt, width, dokumenter, valgteVedlegg, setValgteVedlegg }: BrevVedleggProps) => {
  return (
    <Nav.Row>
      <Nav.Column xs={width}>
        <Nav.Typo.Element className="fritekst_label">{felt.beskrivelse}</Nav.Typo.Element>
        <VedleggVelger valgteVedlegg={valgteVedlegg} dokumenter={dokumenter} onChange={setValgteVedlegg} />
      </Nav.Column>
    </Nav.Row>
  );
};

export default BrevVedlegg;
