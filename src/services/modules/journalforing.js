import { getAsJson, postAsJson } from "../utils";
import { API_BASE_URL, JOURNALFORING } from "../api-constants";

export const hent = (journalpostID) => getAsJson(`${API_BASE_URL}${JOURNALFORING}/${journalpostID}`);
export const opprett = (data) => postAsJson(`${API_BASE_URL}${JOURNALFORING}/opprett`, data);
export const tilordne = (data) => postAsJson(`${API_BASE_URL}${JOURNALFORING}/tilordne`, data);
export const knytt = (data) => postAsJson(`${API_BASE_URL}${JOURNALFORING}/knytt`, data);
export const nyVurdering = (data) => postAsJson(`${API_BASE_URL}${JOURNALFORING}/nyvurdering`, data);
export const sed = (data) => postAsJson(`${API_BASE_URL}${JOURNALFORING}/sed`, data);
export const hentSakstyper = () => getAsJson(`${API_BASE_URL}${JOURNALFORING}/sakstyper`);
export const hentSakstemaer = (hovedpart, sakstype) =>
  getAsJson(`${API_BASE_URL}${JOURNALFORING}/sakstemaer/${hovedpart}/${sakstype}`);
export const hentBehandlingstemaer = (hovedpart, sakstype, sakstema, behandlingstema) =>
  getAsJson(
    `${API_BASE_URL}${JOURNALFORING}/behandlingstemaer/${hovedpart}/${sakstype}/${sakstema}/${
      behandlingstema ? `?behandlingstema=${behandlingstema}` : ""
    }
    `
  );
export const hentBehandlingstyper = (
  hovedpart,
  sakstype,
  sakstema,
  behandlingstema,
  sistBehandlingstema,
  sistBehandlingstype,
  saksstatus
) =>
  getAsJson(
    `${API_BASE_URL}${JOURNALFORING}/behandlingstyper/${hovedpart}/${sakstype}/${sakstema}/${
      behandlingstema ? `?behandlingstema=${behandlingstema}` : ""
    }${sistBehandlingstema ? `&sistBehandlingstema=${sistBehandlingstema}` : ""}${
      sistBehandlingstype ? `&sistBehandlingstype=${sistBehandlingstype}` : ""
    }${saksstatus ? `&saksstatus=${saksstatus}` : ""}
    `
  );
export const hentBehandlingstyperVirksomhet = (hovedpart, sakstype, sakstema) =>
  getAsJson(`${API_BASE_URL}${JOURNALFORING}/behandlingstyper/${hovedpart}/${sakstype}/${sakstema}`);
