import { getAsJson, cachedGetAsJson, postAsJson } from '../utils';
import { API_BASE_URL, OPPGAVER } from '../api-constants';

export const oversikt = () => getAsJson(`${API_BASE_URL}${OPPGAVER}/oversikt`);

export const sendPlukk = oppgave => postAsJson(`${API_BASE_URL}${OPPGAVER}/plukk`, oppgave);

export const tilbakelegg = oppgave => postAsJson(`${API_BASE_URL}${OPPGAVER}/tilbakelegg`, oppgave);

export const sok = (fnrDnr, cacheDuration = 30) => cachedGetAsJson(`${API_BASE_URL}${OPPGAVER}/sok?fnr=${fnrDnr}`, cacheDuration);
