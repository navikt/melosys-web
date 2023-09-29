import { FysiskDokument } from "Domene";

import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";
import { Table } from "@navikt/ds-react";

interface VedleggRowProps {
  vedlegg: FysiskDokument;
  slettVedlegg: () => void;
}

const VedleggRow = ({ vedlegg, slettVedlegg }: VedleggRowProps) => {
  return (
    <Table.Row className="vedlegg">
      <Table.DataCell>
        <PdfLink journalpostID={vedlegg.journalpostID} dokumentID={vedlegg.dokumentID} tittel={vedlegg.tittel} />
      </Table.DataCell>
      <Table.DataCell>
        <span>{Utils.dato.formatterDatoTilNorsk(vedlegg.dato)}</span>
      </Table.DataCell>
      <Table.DataCell className="icon--cell">
        <Mui.IkonKnapp ariaLabel="Fjern vedlegg" ikon={Ikoner.Bin} onClick={slettVedlegg} />
      </Table.DataCell>
    </Table.Row>
  );
};

export default VedleggRow;
