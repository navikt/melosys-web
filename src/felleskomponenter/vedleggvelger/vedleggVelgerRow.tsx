import { FysiskDokument } from "Domene";

import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";
import { ChangeEvent } from "react";
import { TilgjengeligStandardvedlegg } from "../../services/modules/dokumenter-v2";
import PdfLinkStandardvedlegg from "../pdfLink/pdfLinkStandardvedlegg";

interface VedleggVelgerRowProps {
  vedlegg: FysiskDokument | TilgjengeligStandardvedlegg;
  leggTilVedlegg: () => void;
  slettVedlegg: () => void;
  vedleggErMarkert: boolean;
  disabled?: boolean;
}

function VedleggVelgerRow({
  vedlegg,
  leggTilVedlegg,
  slettVedlegg,
  vedleggErMarkert,
  disabled = false,
}: VedleggVelgerRowProps) {
  const checkboxChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      leggTilVedlegg();
    } else {
      slettVedlegg();
    }
  };

  return (
    <Nav.Table.Row>
      <Nav.Table.DataCell>
        <Nav.Checkbox
          className="vedleggvelger__checkbox"
          onChange={checkboxChangeHandler}
          checked={vedleggErMarkert}
          disabled={disabled}
        >
          &nbsp;
        </Nav.Checkbox>
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>
        {"journalpostID" in vedlegg && "dokumentID" in vedlegg && "tittel" in vedlegg ? (
          <PdfLink journalpostID={vedlegg.journalpostID} dokumentID={vedlegg.dokumentID} tittel={vedlegg.tittel} />
        ) : (
          <PdfLinkStandardvedlegg standardvedlegg={vedlegg} skalViseEgenFrontendTittel />
        )}
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>
        {"dato" in vedlegg ? <span>{Utils.dato.formatterDatoTilNorsk(vedlegg.dato)}</span> : ""}
      </Nav.Table.DataCell>
    </Nav.Table.Row>
  );
}

export default VedleggVelgerRow;
