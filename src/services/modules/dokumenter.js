import { postAsJson } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export function pdfURI(journalforingID, dokumentID) {
  return `${API_BASE_URL}dokumenter/pdf/${journalforingID}/${dokumentID}`;
}

export function lagPdfUtkast(behandlingID, dokumenttypeKode, data) {
  const URI_DOKUMENT_UTKAST = `${API_BASE_URL}dokumenter/utkast/pdf/${behandlingID}/${dokumenttypeKode}`;
  return postAsJson(URI_DOKUMENT_UTKAST, data);
}


export function opprettDokument(behandlingID, dokumenttypeKode, data) {
  const URI_DOKUMENT_OPPRETT = `${API_BASE_URL}dokumenter/opprett/${behandlingID}/${dokumenttypeKode}`;
  const extendedResponse = true;
  return postAsJson(URI_DOKUMENT_OPPRETT, data, extendedResponse);
}
