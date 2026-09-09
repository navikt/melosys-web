import { apnePdfINyFane } from "../../services/utils";
import * as Nav from "../../navFrontend";
import * as Ikoner from "../../resources/images";

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
      title="Åpnes i ny fane"
      aria-label="Åpnes i ny fane"
      onClick={(event) => {
        event.preventDefault();
        apnePdfINyFane(lagPdfUrl(journalpostID, dokumentID), tittel);
      }}
    >
      {`${tittel} `}
      <Ikoner.ExternalLink />
    </Nav.Link>
  );
}

export default PdfLink;
