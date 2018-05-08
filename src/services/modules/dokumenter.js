import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export function hentPdfURI(journalforingID, dokumentID) {
  const URI_DOKUMENT_PDF = `${API_BASE_URL}dokumenter/pdf/${journalforingID}/${dokumentID}`;
  return URI_DOKUMENT_PDF;
}

