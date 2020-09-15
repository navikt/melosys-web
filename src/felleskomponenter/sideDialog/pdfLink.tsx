import React from 'react';
import PT from 'prop-types';

export const lagPdfUrl = (journalpostID: string, dokumentID: string) => `/api/dokumenter/pdf/${journalpostID}/${dokumentID}`;

interface PdfLinkProps {
  journalpostID: string,
  dokumentID: string,
  tittel: string,
}

const PdfLink = ({ journalpostID, dokumentID, tittel }: PdfLinkProps) => (
  <a
    href={lagPdfUrl(journalpostID, dokumentID)}
    rel="noopener noreferrer"
    target="_blank"
  >
    {tittel}
  </a>
);

PdfLink.propTypes = {
  journalpostID: PT.string.isRequired,
  dokumentID: PT.string.isRequired,
  tittel: PT.string.isRequired,
};

export default PdfLink;
