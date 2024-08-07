import { FysiskDokument } from "Domene";

import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";
import * as Nav from "../../navFrontend";

interface VedleggRowProps {
  vedlegg: FysiskDokument;
  slettVedlegg: () => void;
  redigerbart: boolean;
}

const VedleggRow = ({ vedlegg, slettVedlegg, redigerbart }: VedleggRowProps) => {
  return (
    <Nav.Table.Row className="vedlegg">
      <Nav.Table.DataCell>
        <PdfLink journalpostID={vedlegg.journalpostID} dokumentID={vedlegg.dokumentID} tittel={vedlegg.tittel} />
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>
        <span>{Utils.dato.formatterDatoTilNorsk(vedlegg.dato)}</span>
      </Nav.Table.DataCell>
      <Nav.Table.DataCell className="icon__cell">
        <Mui.IkonKnapp ariaLabel="Fjern vedlegg" ikon={Ikoner.Bin} onClick={slettVedlegg} disabled={!redigerbart} />
      </Nav.Table.DataCell>
    </Nav.Table.Row>
  );
};

export default VedleggRow;
