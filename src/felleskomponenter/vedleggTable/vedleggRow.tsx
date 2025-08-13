import PdfLink from "../pdfLink";
import * as Utils from "../../utils";
import * as Mui from "../ui";
import * as Ikoner from "../../resources/images";
import * as Nav from "../../navFrontend";
import { FysiskDokument, TilgjengeligStandardvedlegg } from "../../services/modules/dokumenter-v2";
import PdfLinkStandardvedlegg from "../pdfLink/pdfLinkStandardvedlegg";
import "./vedleggRow.less";

interface VedleggRowProps {
  vedlegg: FysiskDokument | TilgjengeligStandardvedlegg;
  slettVedlegg: () => void;
  redigerbart: boolean;
}

// Type guard function to check if vedlegg is TilgjengeligStandardvedlegg
function erTilgjengeligStandardvedlegg(
  vedlegg: FysiskDokument | TilgjengeligStandardvedlegg,
): vedlegg is TilgjengeligStandardvedlegg {
  return "type" in vedlegg && "frontendTittel" in vedlegg;
}

// Hvis redigerbart har blitt sendt inn som false, skal vi vise dokumenttittel.
function skalViseEgenFrontendTittel(redigerbart: boolean) {
  return redigerbart;
}

function VedleggRow({ vedlegg, slettVedlegg, redigerbart }: VedleggRowProps) {
  if (erTilgjengeligStandardvedlegg(vedlegg)) {
    return (
      <Nav.Table.Row className="vedlegg vedlegg-row">
        <Nav.Table.DataCell>
          <Ikoner.Binders className="document-icon" stroke="#0067C5" />
          <PdfLinkStandardvedlegg
            standardvedlegg={vedlegg}
            skalViseEgenFrontendTittel={skalViseEgenFrontendTittel(redigerbart)}
          />
        </Nav.Table.DataCell>
        <Nav.Table.DataCell />
        <Nav.Table.DataCell className="icon__cell">
          {redigerbart && (
            <Mui.IkonKnapp ariaLabel="Fjern vedlegg" ikon={Ikoner.Bin} onClick={slettVedlegg} disabled={!redigerbart} />
          )}
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
        <Mui.IkonKnapp ariaLabel="Fjern vedlegg" ikon={Ikoner.Bin} onClick={slettVedlegg} disabled={!redigerbart} />
      </Nav.Table.DataCell>
    </Nav.Table.Row>
  );
}

export default VedleggRow;
