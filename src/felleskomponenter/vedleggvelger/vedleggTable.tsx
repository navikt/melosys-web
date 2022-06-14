import { FysiskDokument } from "Domene";
import React from "react";
import classNames from "classnames";

import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";

interface EnkeltVedleggProps {
  vedlegg: FysiskDokument;
  leggTilVedlegg: () => void;
  slettVedlegg: () => void;
  vedleggErMarkert: boolean;
  redigerer: boolean;
}

export const EnkeltVedlegg = ({
  vedlegg,
  leggTilVedlegg,
  slettVedlegg,
  vedleggErMarkert,
  redigerer,
}: EnkeltVedleggProps) => {
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
        <td>
          <Mui.Knapp type="flat" ikon={Ikoner.BinBlack} onClick={slettVedlegg} />
        </td>
      )}
    </tr>
  );
};

interface VedleggTableProps {
  valgteVedlegg: FysiskDokument[];
  alleVedlegg: FysiskDokument[];
  redigerer: boolean;
  slettVedlegg: (vedleggID: string) => void;
  leggTilVedlegg: (vedlegg: FysiskDokument) => void;
}

export const VedleggTable = ({
  valgteVedlegg,
  alleVedlegg,
  redigerer,
  slettVedlegg,
  leggTilVedlegg,
}: VedleggTableProps) => {
  const vedleggErMarkert = (vedleggID: string) => Boolean(valgteVedlegg.find((vedlegg) => vedlegg.id === vedleggID));

  const hentGjeldendeVedlegg = () => (redigerer ? alleVedlegg : valgteVedlegg);

  return (
    <table className="vedleggtable">
      <tbody>
        {hentGjeldendeVedlegg().map((enkeltVedlegg) => (
          <EnkeltVedlegg
            key={enkeltVedlegg.id}
            vedlegg={enkeltVedlegg}
            leggTilVedlegg={() => leggTilVedlegg(enkeltVedlegg)}
            slettVedlegg={() => slettVedlegg(enkeltVedlegg.id)}
            vedleggErMarkert={vedleggErMarkert(enkeltVedlegg.id)}
            redigerer={redigerer}
          />
        ))}
      </tbody>
    </table>
  );
};
