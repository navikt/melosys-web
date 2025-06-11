import { apnePdfINyFane } from "../../services/utils";
import * as Nav from "../../navFrontend";

export const lagPdfUrl = (journalpostID: string, dokumentID: string) =>
  `/api/dokumenter/${journalpostID}/${dokumentID}`;

interface PdfLinkProps {
  journalpostID: string;
  dokumentID: string;
  tittel: string;
}

interface PdfLinkProps {
  journalpostID: string;
  dokumentID: string;
  tittel: string;
}

function PdfLink({ journalpostID, dokumentID, tittel }: PdfLinkProps) {
  return (
    <Nav.Link
      href="#"
      onClick={(event) => {
        event.preventDefault();
        apnePdfINyFane(lagPdfUrl(journalpostID, dokumentID));
      }}
    >
      {`${tittel} (åpnes i ny fane)`}
    </Nav.Link>
  );
}

export default PdfLink;
