import { cachedGetAsJson, getAsJson } from "../utils";
import { API_BASE_URL, KODEVERK } from "../api-constants";

const NAV_FELLES = "nav-felles";
const MELOSYS_INTERNT = "melosys-internt";

export const hentFolketrygdenKodeverk = () => getAsJson(`${API_BASE_URL}${KODEVERK}/${MELOSYS_INTERNT}/folketrygden`);
export const hentNavFellesKodeverk = (kodeverknavn: string) =>
  cachedGetAsJson(`${API_BASE_URL}${KODEVERK}/${NAV_FELLES}/${kodeverknavn}`, 3600);
export function hentLandkoderIso2() {
  return hentNavFellesKodeverk("LANDKODER_ISO2");
}
