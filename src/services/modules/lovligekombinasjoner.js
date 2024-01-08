import * as QS from "qs";
import { getAsJson } from "../utils";
import { API_BASE_URL, SAKSBEHANDLING } from "../api-constants";

const URI_PATH = `${API_BASE_URL}${SAKSBEHANDLING}`;

export const hentSakstyper = (saksnummer) => {
  const params = QS.stringify({ saksnummer });
  return getAsJson(`${URI_PATH}/sakstyper/hent-lovlige-kombinasjoner/?${params}`);
};

export const hentSakstemaer = (hovedpart, sakstype, saksnummer) => {
  const params = QS.stringify({ hovedpart, sakstype, saksnummer });
  return getAsJson(`${URI_PATH}/sakstemaer/hent-lovlige-kombinasjoner/?${params}`);
};

export const hentBehandlingstemaer = (hovedpart, sakstype, sakstema, aktivBehandlingID, sistBehandlingstema) => {
  const params = QS.stringify({ hovedpart, sakstype, sakstema, aktivBehandlingID, sistBehandlingstema });
  return getAsJson(`${URI_PATH}/behandlingstemaer/hent-lovlige-kombinasjoner/?${params}`);
};
export const hentBehandlingstyper = (
  hovedpart,
  sakstype,
  sakstema,
  behandlingstema,
  aktivBehandlingID,
  sisteBehandlingsID
) => {
  const params = QS.stringify({
    hovedpart,
    sakstype,
    sakstema,
    behandlingstema,
    aktivBehandlingID,
    sisteBehandlingsID,
  });
  return getAsJson(`${URI_PATH}/behandlingstyper/hent-lovlige-kombinasjoner/?${params}`);
};
