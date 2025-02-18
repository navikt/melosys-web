import { getAsJson } from "../../utils";
import { API_BASE_URL, FTRL } from "../../api-constants";

export const hentGyldigeInnvilgelsesresultat = (behandlingstype: string): Promise<string[]> =>
  getAsJson(`${API_BASE_URL}${FTRL}/innvilgelsesresultat/?behandlingstype=${behandlingstype}`);

export const hentGyldigeInnvilgelsesresultatPensjonist = (
  bestemmelse: string,
  trygdedekning: string,
): Promise<string[]> =>
  getAsJson(`${API_BASE_URL}${FTRL}/innvilgelsesresultat/?bestemmelse=${bestemmelse}&trygdedekning=${trygdedekning}`);
