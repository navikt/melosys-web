import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, AVKLARTEFAKTA } from '../api-constants';

export const hent = behandlingID => getAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}`);

export const send = (behandlingID, dokument) => postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}`, dokument);

export const hentOppsummering = behandlingID => getAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/oppsummert`);

export const sendVirksomheter = (behandlingID, virksomheter) => postAsJson(`${API_BASE_URL}${AVKLARTEFAKTA}/${behandlingID}/virksomheter`, virksomheter);
