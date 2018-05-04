import { API_BASE_URL } from './api-constants';

export function PDFDokumentURI(journalforingID, dokumentID) {
  const URI_DOKUMENT_PDF = `${API_BASE_URL}dokumenter/pdf/${journalforingID}/${dokumentID}`;
  return URI_DOKUMENT_PDF;
}
