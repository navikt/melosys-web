import PT from "prop-types";
import * as Nav from "../../navFrontend";
import { TilgjengeligStandardvedlegg } from "../../services/modules/dokumenter-v2";
import { apnePdfINyFane } from "../../services/utils";

export const lagPdfUrl = (standardvedlegg: TilgjengeligStandardvedlegg) =>
  `/api/dokumenter/v2/pdf/utkast/standardvedlegg/${standardvedlegg.type}`;

interface PdfLinkStandardvedleggProps {
  standardvedlegg: TilgjengeligStandardvedlegg;
}

function PdfLinkStandardvedlegg({ standardvedlegg }: PdfLinkStandardvedleggProps) {
  return (
    <Nav.Link
      href="#"
      onClick={(event) => {
        event.preventDefault();
        apnePdfINyFane(lagPdfUrl(standardvedlegg));
      }}
    >
      {`${standardvedlegg.frontendTittel} (åpnes i ny fane)`}
    </Nav.Link>
  );
}

PdfLinkStandardvedlegg.propTypes = {
  standardvedlegg: PT.object.isRequired,
};

export default PdfLinkStandardvedlegg;
