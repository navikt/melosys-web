import React from "react";
import PT from "prop-types";
import { apnePdfINyFane } from "../../services/utils";
import * as Nav from "../../navFrontend";

export const lagPdfUrl = (journalpostID: string, dokumentID: string) =>
  `/api/dokumenter/pdf/${journalpostID}/${dokumentID}`;

interface PdfLinkProps {
  journalpostID: string;
  dokumentID: string;
  tittel: string;
}

const PdfLink = ({ journalpostID, dokumentID, tittel }: PdfLinkProps) => (
  <Nav.Lenker href="#" onClick={() => apnePdfINyFane(lagPdfUrl(journalpostID, dokumentID))} target="_blank">
    {tittel}
  </Nav.Lenker>
);

PdfLink.propTypes = {
  journalpostID: PT.string.isRequired,
  dokumentID: PT.string.isRequired,
  tittel: PT.string.isRequired,
};

export default PdfLink;
