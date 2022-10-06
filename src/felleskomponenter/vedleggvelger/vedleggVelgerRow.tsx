import { FysiskDokument } from "Domene";
import React from "react";

import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";

interface VedleggVelgerRowProps {
  vedlegg: FysiskDokument;
  leggTilVedlegg: () => void;
  slettVedlegg: () => void;
  vedleggErMarkert: boolean;
}

const VedleggVelgerRow = ({ vedlegg, leggTilVedlegg, slettVedlegg, vedleggErMarkert }: VedleggVelgerRowProps) => {
  const checkboxChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      leggTilVedlegg();
    } else {
      slettVedlegg();
    }
  };

  return (
    <tr className="vedlegg">
      <td>
        <Nav.Checkbox onChange={checkboxChangeHandler} checked={vedleggErMarkert} label="&nbsp;" />
      </td>
      <td>
        <PdfLink journalpostID={vedlegg.journalpostID} dokumentID={vedlegg.dokumentID} tittel={vedlegg.tittel} />
      </td>
      <td>
        <span>{Utils.dato.formatterDatoTilNorsk(vedlegg.dato)}</span>
      </td>
    </tr>
  );
};

export default VedleggVelgerRow;
