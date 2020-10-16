import {getAsJson, postAsJson} from '../../utils';
import { API_BASE_URL, BEHANDLINGER } from '../../api-constants';

export const hentBehandling = behandlingID => getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}`);

export const hentMuligeBehandlingstema = behandlingID => getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/muligeBehandlingstema`);

export const endreBehandlingstema = (behandlingID, behandlingstema) => postAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingID}/endreBehandlingstema`, { behandlingstema });
