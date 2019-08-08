import { getAsJson, postAsJson } from '../utils';
import { API_BASE_URL, OPPGAVER } from '../api-constants';

export const oversikt = () => getAsJson(`${API_BASE_URL}${OPPGAVER}/oversikt`);

export const send = oppgave => postAsJson(`${API_BASE_URL}${OPPGAVER}/plukk`, oppgave);

export const opprett = oppgave => postAsJson(`${API_BASE_URL}${OPPGAVER}/opprett`, oppgave);

export const tilbakelegge = oppgave => postAsJson(`${API_BASE_URL}${OPPGAVER}/tilbakelegge`, oppgave);
