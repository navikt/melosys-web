import { getAsJson, postAsJson, postAsJsonReceiveAsPDF } from '../utils';
import { API_BASE_URL, DOKUMENTER } from '../api-constants';

// eslint-disable-next-line import/prefer-default-export
export const pdfURI = (journalpostID, dokumentID) => (`${API_BASE_URL}${DOKUMENTER}/pdf/${journalpostID}/${dokumentID}`);

export const hentDokument = (journalpostID, dokumentID) => getAsJson(pdfURI(journalpostID, dokumentID));
/**
 * Lag pdfUtkast henter pdf dokument basert på :behandligID og :dokumentytpekode
 * @param behandlingID
 * @param dokumenttypeKode
 * @param data
 * @returns {Promise<*>} PDF dokument
 */
export const forhandsvisPDF = (behandlingID, dokumenttypeKode, data) => postAsJsonReceiveAsPDF(`${API_BASE_URL}${DOKUMENTER}/utkast/pdf/${behandlingID}/${dokumenttypeKode}`, data, true);

/**
 * opprettDokument gjør oppslag DocProd med :behandlingID og :dokumenttypeKode
 * @param behandlingID
 * @param dokumenttypeKode see kodeverk#dokumenttyper
 * @param dokument
 * @returns {Promise<*>} med {location: `/dokumenter/pdf/${journalpostID}/${dokumentID}`}
 * Retur objektet benyttes til å kalle
 */
export const opprettDokument = (behandlingID, dokumenttypeKode, dokument) => postAsJson(`${API_BASE_URL}${DOKUMENTER}/opprett/${behandlingID}/${dokumenttypeKode}`, dokument);
export const hentOversiktDokumenter = snr => getAsJson(`${API_BASE_URL}${DOKUMENTER}/oversikt/${snr}`);
