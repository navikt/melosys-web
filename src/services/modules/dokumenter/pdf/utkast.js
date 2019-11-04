import { getAsPDF, postAsJsonReceiveAsPDF } from '../../../utils';
import { API_BASE_URL, DOKUMENTER } from '../../../api-constants';


/**
 * Lag pdfUtkast henter pdf dokument basert på :behandligID og :dokumentytpekode
 * @param behandlingID
 * @param produserbartDokument
 * @param data
 * @returns {Promise<*>} PDF dokument
 */
export const forhandsvisBrev = (behandlingID, produserbartDokument, data) => postAsJsonReceiveAsPDF(`${API_BASE_URL}${DOKUMENTER}/pdf/brev/utkast/${behandlingID}/${produserbartDokument}`, data, true);

export const forhandsvisSed = (behandlingID, sedType) => getAsPDF(`${API_BASE_URL}${DOKUMENTER}/pdf/sed/utkast/${behandlingID}/${sedType}`, true);

