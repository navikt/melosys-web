import { FysiskDokument } from "Domene";

import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Nav from "../../navFrontend";
import { ChangeEvent } from "react";
import { Table } from "@navikt/ds-react";

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
    <Table.Row>
      <Table.DataCell>
        <Nav.Checkbox
          className="vedleggvelger__checkbox"
          onChange={checkboxChangeHandler}
          checked={vedleggErMarkert}
          label="&nbsp;"
        />
      </Table.DataCell>
      <Table.DataCell>
        <PdfLink journalpostID={vedlegg.journalpostID} dokumentID={vedlegg.dokumentID} tittel={vedlegg.tittel} />
      </Table.DataCell>
      <Table.DataCell>
        <span>{Utils.dato.formatterDatoTilNorsk(vedlegg.dato)}</span>
      </Table.DataCell>
    </Table.Row>
  );
};

export default VedleggVelgerRow;
