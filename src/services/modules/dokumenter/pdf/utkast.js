import { postAsJsonReceiveAsPDF } from '../../../utils';
import { API_BASE_URL, DOKUMENTER } from '../../../api-constants';


/**
 * Lag pdfUtkast henter pdf dokument basert på :behandligID og :dokumentytpekode
 * @param behandlingID
 * @param produserbartDokument
 * @param data
 * @returns {Promise<*>} PDF dokument
 */
export const forhandsvisPDF = (behandlingID, produserbartDokument, data) => postAsJsonReceiveAsPDF(`${API_BASE_URL}${DOKUMENTER}/pdf/utkast/${behandlingID}/${produserbartDokument}`, data, true);

