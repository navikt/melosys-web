import { getAsJson } from "../utils";
import { API_BASE_URL } from "../api-constants";
import { BrevAdresse } from "./dokumenter-v2";

export const hentPersonAdresse = (personIdent: string): Promise<BrevAdresse> =>
  getAsJson(`${API_BASE_URL}/adresser?personIdent=${personIdent}`);

export const hentOrganisasjonAdresse = (orgnr: string): Promise<BrevAdresse> =>
  getAsJson(`${API_BASE_URL}/adresser?orgnr=${orgnr}`);
