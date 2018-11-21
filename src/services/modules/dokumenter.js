import { getAsJson, postAsJson, postAsJsonReceiveAsPDF } from '../utils';
import { API_BASE_URL } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
const pdfURI = (journalforingID, dokumentID) => (`${API_BASE_URL}dokumenter/pdf/${journalforingID}/${dokumentID}`);

const hentDokument = (journalforingID, dokumentID) => getAsJson(pdfURI(journalforingID, dokumentID));
/**
 * Lag pdfUtkast henter pdf dokument basert på :behandligID og :dokumentytpekode
 * @param behandlingID
 * @param dokumenttypeKode
 * @param data
 * @returns {Promise<*>} PDF dokument
 */
const forhandsvisPDF = (behandlingID, dokumenttypeKode, data) => {
  const URI_DOKUMENT_UTKAST = `${API_BASE_URL}dokumenter/utkast/pdf/${behandlingID}/${dokumenttypeKode}`;
  return postAsJsonReceiveAsPDF(URI_DOKUMENT_UTKAST, data, true);
};

/**
 * opprettDokument gjør oppslag DocProd med :behandlingID og :dokumenttypeKode
 * @param behandlingID
 * @param dokumenttypeKode see kodeverk#dokumenttyper
 * @param dokument
 * @returns {Promise<*>} med {location: `/dokumenter/pdf/${journalforingID}/${dokumentID}`}
 * Retur objektet benyttes til å kalle
 */
const opprettDokument = (behandlingID, dokumenttypeKode, dokument) => {
  const URI_DOKUMENT_OPPRETT = `${API_BASE_URL}dokumenter/opprett/${behandlingID}/${dokumenttypeKode}`;
  return postAsJson(URI_DOKUMENT_OPPRETT, dokument);
};
const hentOversiktDokumenter = snr => {
  const URI_DOKUMENT_OVERSIKT = `${API_BASE_URL}dokumenter/oversikt/${snr}`;
  return getAsJson(URI_DOKUMENT_OVERSIKT);
};
export {
  pdfURI,
  hentDokument,
  forhandsvisPDF,
  opprettDokument,
  hentOversiktDokumenter,
};
