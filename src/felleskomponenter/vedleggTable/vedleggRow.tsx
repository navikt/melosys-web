import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";
import * as Nav from "../../navFrontend";
import { FysiskDokument, TilgjengeligStandardvedlegg } from "../../services/modules/dokumenter-v2";
import PdfLinkStandardvedlegg from "../pdfLink/pdfLinkStandardvedlegg";

interface VedleggRowProps {
  vedlegg: FysiskDokument | TilgjengeligStandardvedlegg;
  slettSaksvedlegg: () => void;
  slettStandardvedlegg: () => void;
  redigerbart: boolean;
}

// Type guard function to check if vedlegg is TilgjengeligStandardvedlegg
function erTilgjengeligStandardvedlegg(
  vedlegg: FysiskDokument | TilgjengeligStandardvedlegg,
): vedlegg is TilgjengeligStandardvedlegg {
  return "type" in vedlegg && "frontendTittel" in vedlegg;
}

function VedleggRow({ vedlegg, slettSaksvedlegg, slettStandardvedlegg, redigerbart }: VedleggRowProps) {
  if (erTilgjengeligStandardvedlegg(vedlegg)) {
    return (
      <Nav.Table.Row className="vedlegg">
        <Nav.Table.DataCell>
          <PdfLinkStandardvedlegg standardvedlegg={vedlegg} />
        </Nav.Table.DataCell>
        <Nav.Table.DataCell />
        <Nav.Table.DataCell className="icon__cell">
          <Mui.IkonKnapp
            ariaLabel="Fjern vedlegg"
            ikon={Ikoner.Bin}
            onClick={slettStandardvedlegg}
            disabled={!redigerbart}
          />
        </Nav.Table.DataCell>
      </Nav.Table.Row>
    );
  }

  return (
    <Nav.Table.Row className="vedlegg">
      <Nav.Table.DataCell>
        <PdfLink journalpostID={vedlegg.journalpostID} dokumentID={vedlegg.dokumentID} tittel={vedlegg.tittel} />
      </Nav.Table.DataCell>
      <Nav.Table.DataCell>
        <span>{Utils.dato.formatterDatoTilNorsk(vedlegg.dato)}</span>
      </Nav.Table.DataCell>
      <Nav.Table.DataCell className="icon__cell">
        <Mui.IkonKnapp ariaLabel="Fjern vedlegg" ikon={Ikoner.Bin} onClick={slettSaksvedlegg} disabled={!redigerbart} />
      </Nav.Table.DataCell>
    </Nav.Table.Row>
  );
}

export default VedleggRow;
