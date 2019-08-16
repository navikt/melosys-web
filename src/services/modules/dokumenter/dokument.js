import { getAsJson, postAsJson } from '../../utils';
import { API_BASE_URL, DOKUMENTER} from '../../api-constants';

export const opprett = (behandlingID, produserbartDokument, dokument) => postAsJson(`${API_BASE_URL}${DOKUMENTER}/opprett/${behandlingID}/${produserbartDokument}`, dokument);

export const hentOversikt = snr => getAsJson(`${API_BASE_URL}${DOKUMENTER}/oversikt/${snr}`);
