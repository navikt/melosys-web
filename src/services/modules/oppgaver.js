import { getAsJson, cachedGetAsJson, postAsJson } from "../utils";
import { API_BASE_URL, OPPGAVER } from "../api-constants";

export const oversikt = () => getAsJson(`${API_BASE_URL}${OPPGAVER}/oversikt`);

export const sendPlukk = (body) => postAsJson(`${API_BASE_URL}${OPPGAVER}/plukk`, body);

export const tilbakelegg = (body) => postAsJson(`${API_BASE_URL}${OPPGAVER}/tilbakelegg`, body);

export const sok = (personIdent, orgnr, cacheDuration = 30) =>
  cachedGetAsJson(
    `${API_BASE_URL}${OPPGAVER}/sok?personIdent=${personIdent || ""}&orgnr=${orgnr || ""}`,
    cacheDuration
  );
