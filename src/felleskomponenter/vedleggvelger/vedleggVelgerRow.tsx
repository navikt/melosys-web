import { FysiskDokument } from "Domene";

import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";
import { ChangeEvent } from "react";

interface VedleggVelgerRowProps {
  vedlegg: FysiskDokument;
  leggTilVedlegg: () => void;
  slettVedlegg: () => void;
  vedleggErMarkert: boolean;
}

const VedleggVelgerRow = ({ vedlegg, leggTilVedlegg, slettVedlegg, vedleggErMarkert }: VedleggVelgerRowProps) => {
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
        <Nav.Checkbox className="vedleggvelger__checkbox" onChange={checkboxChangeHandler} checked={vedleggErMarkert}>
          &nbsp;
        </Nav.Checkbox>
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>
        <PdfLink journalpostID={vedlegg.journalpostID} dokumentID={vedlegg.dokumentID} tittel={vedlegg.tittel} />
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>
        <span>{Utils.dato.formatterDatoTilNorsk(vedlegg.dato)}</span>
      </Nav.Table.DataCell>
    </Nav.Table.Row>
  );
};

export default VedleggVelgerRow;
