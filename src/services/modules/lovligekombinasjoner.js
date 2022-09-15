import * as QS from "qs";
import { getAsJson } from "../utils";
import { API_BASE_URL, SAKSBEHANDLING } from "../api-constants";

const URI_PATH = `${API_BASE_URL}${SAKSBEHANDLING}`;

export const hentSakstyper = () => getAsJson(`${URI_PATH}/sakstyper/hent-lovlige-kombinasjoner`);

export const hentSakstemaer = (hovedpart, sakstype) => {
  const params = QS.stringify({ hovedpart, sakstype });
  return getAsJson(`${URI_PATH}/sakstemaer/hent-lovlige-kombinasjoner/?${params}`);
};

export const hentBehandlingstemaer = (hovedpart, sakstype, sakstema, sistBehandlingstema) => {
  const params = QS.stringify({ hovedpart, sakstype, sakstema, sistBehandlingstema });
  return getAsJson(`${URI_PATH}/behandlingstemaer/hent-lovlige-kombinasjoner/?${params}`);
};
export const hentBehandlingstyper = (hovedpart, sakstype, sakstema, behandlingstema, sisteBehandlingsID) => {
  const params = QS.stringify({ hovedpart, sakstype, sakstema, behandlingstema, sisteBehandlingsID });
  return getAsJson(`${URI_PATH}/behandlingstyper/hent-lovlige-kombinasjoner/?${params}`);
};

export const hentSakstemaerForOppgaveplukker = (sakstype) => {
  return getAsJson(`${URI_PATH}/sakstemaer/oppgaveplukker/hent-lovlige-kombinasjoner/?sakstype=${sakstype}`);
};

export const hentBehandlingstemaerForOppgaveplukker = (sakstype, sakstema, sistBehandlingstema) => {
  const params = QS.stringify({ sakstype, sakstema, sistBehandlingstema });
  return getAsJson(`${URI_PATH}/behandlingstemaer/oppgaveplukker/hent-lovlige-kombinasjoner/?${params}`);
};
export const hentBehandlingstyperForOppgaveplukker = (sakstype, sakstema, behandlingstema, sisteBehandlingsID) => {
  const params = QS.stringify({ sakstype, sakstema, behandlingstema, sisteBehandlingsID });
  return getAsJson(`${URI_PATH}/behandlingstyper/oppgaveplukker/hent-lovlige-kombinasjoner/?${params}`);
};
