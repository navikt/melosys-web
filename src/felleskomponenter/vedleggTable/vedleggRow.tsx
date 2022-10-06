import { FysiskDokument } from "Domene";
import React from "react";

import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";

interface VedleggRowProps {
  vedlegg: FysiskDokument;
  slettVedlegg: () => void;
}

const VedleggRow = ({ vedlegg, slettVedlegg }: VedleggRowProps) => {
  return (
    <tr className="vedlegg">
      <td>
        <PdfLink journalpostID={vedlegg.journalpostID} dokumentID={vedlegg.dokumentID} tittel={vedlegg.tittel} />
      </td>
      <td>
        <span>{Utils.dato.formatterDatoTilNorsk(vedlegg.dato)}</span>
      </td>
      <td className="icon--cell">
        <Mui.Knapp type="flat" ikon={Ikoner.BinBlack} onClick={slettVedlegg} />
      </td>
    </tr>
  );
};

export default VedleggRow;
