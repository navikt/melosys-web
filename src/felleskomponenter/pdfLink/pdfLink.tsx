import PT from "prop-types";
import { apnePdfINyFane } from "../../services/utils";
import * as Nav from "../../navFrontend";

export const lagPdfUrl = (journalpostID: string, dokumentID: string) =>
  `/api/dokumenter/${journalpostID}/${dokumentID}`;

interface PdfLinkProps {
  journalpostID: string;
  dokumentID: string;
  tittel: string;
}

const PdfLink = ({ journalpostID, dokumentID, tittel }: PdfLinkProps) => (
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

PdfLink.propTypes = {
  journalpostID: PT.string.isRequired,
  dokumentID: PT.string.isRequired,
  tittel: PT.string.isRequired,
};

export default PdfLink;
