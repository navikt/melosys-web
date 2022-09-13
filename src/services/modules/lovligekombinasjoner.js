import * as QS from "qs";
import { getAsJson } from "../utils";
import { API_BASE_URL, LOVLIGE_KOMBINASJONER } from "../api-constants";

const URI_PATH = `${API_BASE_URL}${LOVLIGE_KOMBINASJONER}`;

export const hentSakstyper = () => getAsJson(`${URI_PATH}/sakstyper`);

export const hentSakstemaer = (hovedpart, sakstype) => {
  const params = QS.stringify({ hovedpart, sakstype });
  return getAsJson(`${URI_PATH}/sakstemaer/?${params}`);
};

export const hentBehandlingstemaer = (hovedpart, sakstype, sakstema, sistBehandlingstema) => {
  const params = QS.stringify({ hovedpart, sakstype, sakstema, sistBehandlingstema });
  return getAsJson(`${URI_PATH}/behandlingstemaer/?${params}`);
};
export const hentBehandlingstyper = (hovedpart, sakstype, sakstema, behandlingstema, sisteBehandlingsID) => {
  const params = QS.stringify({ hovedpart, sakstype, sakstema, behandlingstema, sisteBehandlingsID });
  return getAsJson(`${URI_PATH}/behandlingstyper/?${params}`);
};
