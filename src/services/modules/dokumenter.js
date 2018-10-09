import { postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export function pdfURI(journalforingID, dokumentID) {
  const URI_DOKUMENT_PDF = `${API_BASE_URL}dokumenter/pdf/${journalforingID}/${dokumentID}`;
  return URI_DOKUMENT_PDF;
}

export function lagPdfUtkast(behandlingID, dokumenttypeKode, data) {
  const URI_DOKUMENT_UTKAST = `${API_BASE_URL}dokumenter/utkast/pdf/${behandlingID}/${dokumenttypeKode}`;
  return postAsJson(URI_DOKUMENT_UTKAST, data);
}


export function opprettDokument(behandlingID, dokumenttypeKode, data) {
  const URI_DOKUMENT_OPPRETT = `${API_BASE_URL}dokumenter/opprett/${behandlingID}/${dokumenttypeKode}`;
  return postAsJson(URI_DOKUMENT_OPPRETT, data, true);
}
