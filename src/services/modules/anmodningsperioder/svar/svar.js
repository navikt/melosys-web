import { postAsJson, getAsJson } from '../../../utils';
import { API_BASE_URL, ANMODNINGSPERIODER, SVAR } from '../../../api-constants';


export const hent = anmodningsperiodeID => getAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${anmodningsperiodeID}/${SVAR}`);

export const send = (anmodningsperiodeID, body) => postAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${anmodningsperiodeID}/${SVAR}`, body);
