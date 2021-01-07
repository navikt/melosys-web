import { getAsJson } from "../utils";
import { API_BASE_URL, KODEVERK } from "../api-constants";

const NAV_FELLES = "nav-felles";
const MELOSYS_INTERNT = "melosys-internt";

// eslint-disable-next-line import/prefer-default-export
export const hentFolketrygdenKodeverk = () => getAsJson(`${API_BASE_URL}${KODEVERK}/${MELOSYS_INTERNT}/folketrygden`);
export const hentNavFellesKodeverk = (kodeverknavn: string) =>
  getAsJson(`${API_BASE_URL}${KODEVERK}/${NAV_FELLES}/${kodeverknavn}`);
export function hentLandkoderIso2() {
  return hentNavFellesKodeverk("LANDKODERISO2");
}
