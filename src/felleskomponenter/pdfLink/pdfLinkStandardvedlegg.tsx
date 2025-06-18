import * as Nav from "../../navFrontend";
import { TilgjengeligStandardvedlegg } from "../../services/modules/dokumenter-v2";
import { apnePdfINyFane } from "../../services/utils";

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
      onClick={(event) => {
        event.preventDefault();
        apnePdfINyFane(lagPdfUrl(standardvedlegg));
      }}
      title={skalViseEgenFrontendTittel ? standardvedlegg.frontendTittel : standardvedlegg.dokumentTittel}
    >
      {skalViseEgenFrontendTittel ? standardvedlegg.frontendTittel : standardvedlegg.dokumentTittel}
    </Nav.Link>
  );
}

export default PdfLinkStandardvedlegg;
