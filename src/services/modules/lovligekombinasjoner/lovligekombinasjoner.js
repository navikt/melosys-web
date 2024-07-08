import * as QS from "qs";
import { getAsJson } from "../../utils";
import { API_BASE_URL, SAKSBEHANDLING } from "../../api-constants";

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

export const hentBehandlingstyper = (hovedpart, sakstype, sakstema, behandlingstema) => {
  const params = QS.stringify({
    hovedpart,
    sakstype,
    sakstema,
    behandlingstema,
  });
  return getAsJson(`${URI_PATH}/behandlingstyper/kombinasjoner/?${params}`);
};

export const hentBehandlingstyperForEndring = (hovedpart, sakstype, sakstema, behandlingstema, saksnummer) => {
  const params = QS.stringify({
    hovedpart,
    sakstype,
    sakstema,
    behandlingstema,
  });
  return getAsJson(`${URI_PATH}/${saksnummer}/behandlingstyper/kombinasjoner-for-endring/?${params}`);
};

export const hentBehandlingstyperForKnyttTilSak = (hovedpart, saksnummer, behandlingstema) => {
  const params = QS.stringify({
    hovedpart,
    behandlingstema,
  });
  return getAsJson(`${URI_PATH}/${saksnummer}/behandlingstyper/kombinasjoner-for-knytt-sak/?${params}`);
};

export const hentBehandlingsårsaktyper = (behandlingstype) => {
  const params = QS.stringify({ behandlingstype });
  return getAsJson(`${URI_PATH}/behandlingsaarsaktyper/hent-lovlige-kombinasjoner/?${params}`);
};
