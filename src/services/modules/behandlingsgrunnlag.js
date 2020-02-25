import { API_BASE_URL, BEHANDLINGSGRUNNLAG } from '../api-constants';

import { getAsJson, postAsJson } from '../utils';

export const hent = behandlingID => getAsJson(`${API_BASE_URL}${BEHANDLINGSGRUNNLAG}/${behandlingID}`);
export const send = (behandlingID, behandlingsgrunnlag) => postAsJson(`${API_BASE_URL}${BEHANDLINGSGRUNNLAG}/${behandlingID}`, behandlingsgrunnlag);
