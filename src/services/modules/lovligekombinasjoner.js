import { getAsJson } from "../utils";
import { API_BASE_URL, LOVLIGEKOMBINASJONER } from "../api-constants";

export const hentSakstyper = () => getAsJson(`${API_BASE_URL}${LOVLIGEKOMBINASJONER}/sakstyper`);
export const hentSakstemaer = (hovedpart, sakstype) =>
  getAsJson(`${API_BASE_URL}${LOVLIGEKOMBINASJONER}/sakstemaer/${hovedpart}/${sakstype}`);
export const hentBehandlingstemaer = (hovedpart, sakstype, sakstema, behandlingstema) =>
  getAsJson(
    `${API_BASE_URL}${LOVLIGEKOMBINASJONER}/behandlingstemaer/${hovedpart}/${sakstype}/${sakstema}/${
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
    `${API_BASE_URL}${LOVLIGEKOMBINASJONER}/behandlingstyper/${hovedpart}/${sakstype}/${sakstema}/${
      behandlingstema ? `?behandlingstema=${behandlingstema}` : ""
    }${sistBehandlingstema ? `&sistBehandlingstema=${sistBehandlingstema}` : ""}${
      sistBehandlingstype ? `&sistBehandlingstype=${sistBehandlingstype}` : ""
    }${saksstatus ? `&saksstatus=${saksstatus}` : ""}
    `
  );
export const hentBehandlingstyperVirksomhet = (hovedpart, sakstype, sakstema) =>
  getAsJson(`${API_BASE_URL}${LOVLIGEKOMBINASJONER}/behandlingstyper/${hovedpart}/${sakstype}/${sakstema}`);
