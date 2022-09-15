import { FysiskDokument } from "Domene";
import React from "react";
import classNames from "classnames";

import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";

interface VedleggRowProps {
  vedlegg: FysiskDokument;
  leggTilVedlegg: () => void;
  slettVedlegg: () => void;
  vedleggErMarkert: boolean;
  redigerer: boolean;
}

const VedleggRow = ({ vedlegg, leggTilVedlegg, slettVedlegg, vedleggErMarkert, redigerer }: VedleggRowProps) => {
  const checkboxChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      leggTilVedlegg();
    } else {
      slettVedlegg();
    }
  };

  const cls = classNames({
    "enkeltvedlegg--border-bottom": redigerer,
    enkeltvedlegg: !redigerer,
  });

  return (
    <tr className={cls}>
      {redigerer ? (
        <td>
          <Nav.Checkbox onChange={checkboxChangeHandler} checked={vedleggErMarkert} label="&nbsp;" />
        </td>
      ) : null}
      <td>
        <PdfLink journalpostID={vedlegg.journalpostID} dokumentID={vedlegg.dokumentID} tittel={vedlegg.tittel} />
      </td>
      <td>
        <span>{Utils.dato.formatterDatoTilNorsk(vedlegg.dato)}</span>
      </td>
      {!redigerer && (
        <td className="icon--cell">
          <Mui.Knapp type="flat" ikon={Ikoner.BinBlack} onClick={slettVedlegg} />
        </td>
      )}
    </tr>
  );
};

export default VedleggRow;
