import * as Nav from "../../navFrontend";
import { TilgjengeligStandardvedlegg } from "../../services/modules/dokumenter-v2";
import { apnePdfINyFane } from "../../services/utils";
import * as Ikoner from "../../resources/images";

export const lagPdfUrl = (standardvedlegg: TilgjengeligStandardvedlegg) =>
  `/api/dokumenter/v2/pdf/utkast/standardvedlegg/${standardvedlegg.type}`;

interface PdfLinkStandardvedleggProps {
  standardvedlegg: TilgjengeligStandardvedlegg;
  skalViseEgenFrontendTittel: boolean;
}

function PdfLinkStandardvedlegg({ standardvedlegg, skalViseEgenFrontendTittel }: PdfLinkStandardvedleggProps) {
  return (
    <Nav.Link
      href="#"
      title="Åpnes i ny fane"
      aria-label="Åpnes i ny fane"
      onClick={(event) => {
        event.preventDefault();
        apnePdfINyFane(
          lagPdfUrl(standardvedlegg),
          skalViseEgenFrontendTittel ? standardvedlegg.frontendTittel : standardvedlegg.dokumentTittel,
        );
      }}
    >
      {skalViseEgenFrontendTittel ? standardvedlegg.frontendTittel : standardvedlegg.dokumentTittel}
      <Ikoner.ExternalLink />
    </Nav.Link>
  );
}

export default PdfLinkStandardvedlegg;
