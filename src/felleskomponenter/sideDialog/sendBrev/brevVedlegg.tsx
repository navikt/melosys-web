import React from "react";
import { ColumnWidth } from "nav-frontend-grid";
import { FysiskDokument } from "Domene";

import * as Nav from "../../../navFrontend";
import { DokumenterV2 } from "../../../services/api";
import VedleggVelger from "../../vedleggvelger";
import { Fritekstvedlegg } from "./sendBrev";

interface BrevVedleggProps {
  felt: DokumenterV2.Felt;
  width: ColumnWidth;
  dokumenter: FysiskDokument[];
  valgteVedlegg: FysiskDokument[];
  setValgteVedlegg: (valgteVedlegg: FysiskDokument[]) => void;
  fritekstvedlegg: Fritekstvedlegg[];
  redigerFritekstvedlegg: (index: number) => void;
  slettFritekstvedlegg: (index: number) => void;
  lagPdfUrl: (index: number) => Promise<string | false>;
}

const BrevVedlegg = ({
  felt,
  width,
  dokumenter,
  valgteVedlegg,
  setValgteVedlegg,
  fritekstvedlegg,
  redigerFritekstvedlegg,
  slettFritekstvedlegg,
  lagPdfUrl,
}: BrevVedleggProps) => {
  return (
    <Nav.Row>
      <Nav.Column xs={width}>
        <Nav.Typo.Element className="vedlegg_label">{felt.beskrivelse}</Nav.Typo.Element>
        <VedleggVelger
          valgteVedlegg={valgteVedlegg}
          dokumenter={dokumenter}
          onChange={setValgteVedlegg}
          fritekstvedlegg={fritekstvedlegg}
          redigerFritekstvedlegg={redigerFritekstvedlegg}
          slettFritekstvedlegg={slettFritekstvedlegg}
          lagPdfUrl={lagPdfUrl}
        />
      </Nav.Column>
    </Nav.Row>
  );
};

export default BrevVedlegg;
