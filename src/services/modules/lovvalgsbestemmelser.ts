import * as Qs from "qs";
import { KTObject } from "@navikt/melosys-kodeverk";
import { getAsJson } from "../utils";
import { API_BASE_URL, LOVVALGSBESTEMMELSER } from "../api-constants";

type hentLovvalgsbestemmelserRequest = {
  sakstype: string;
  sakstema: string;
  behandlingstema: string;
  land: string;
};

export const hent = (req: hentLovvalgsbestemmelserRequest): Promise<KTObject[]> => {
  const queryparams = Qs.stringify(req, { indices: false });

  return getAsJson(`${API_BASE_URL}${LOVVALGSBESTEMMELSER}?${queryparams}`);
};
