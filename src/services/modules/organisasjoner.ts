import { cachedGetAsJson } from "../utils";
import { API_BASE_URL, ORGANISASJONER } from "../api-constants";

import { Organisasjon } from "./types";

export const hentOrganisasjon = (orgnr: string): Promise<Organisasjon> =>
  cachedGetAsJson(`${API_BASE_URL}${ORGANISASJONER}/${orgnr}`);
