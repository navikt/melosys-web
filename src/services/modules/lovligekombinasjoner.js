import { getAsJson } from "../utils";
import { API_BASE_URL, LOVLIGE_KOMBINASJONER } from "../api-constants";

export const hentSakstyper = () => getAsJson(`${API_BASE_URL}${LOVLIGE_KOMBINASJONER}/sakstyper`);
export const hentSakstemaer = (hovedpart, sakstype) =>
  getAsJson(`${API_BASE_URL}${LOVLIGE_KOMBINASJONER}/sakstemaer/${hovedpart}/${sakstype}`);
export const hentBehandlingstemaer = (hovedpart, sakstype, sakstema, sistBehandlingstema) =>
  getAsJson(
    `${API_BASE_URL}${LOVLIGE_KOMBINASJONER}/behandlingstemaer/${hovedpart}/${sakstype}/${sakstema}/${
      sistBehandlingstema ? `?sistBehandlingstema=${sistBehandlingstema}` : ""
    }
    `
  );
export const hentBehandlingstyper = (hovedpart, sakstype, sakstema, behandlingstema, sisteBehandlingsID) =>
  getAsJson(
    `${API_BASE_URL}${LOVLIGE_KOMBINASJONER}/behandlingstyper/${hovedpart}/${sakstype}/${sakstema}/${
      behandlingstema ? `?behandlingstema=${behandlingstema}` : ""
    }${sisteBehandlingsID ? `&sisteBehandlingsID=${sisteBehandlingsID}` : ""}
    `
  );
