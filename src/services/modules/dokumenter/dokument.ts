import { DokumentOversikt } from "Domene";
import { getAsJson } from "../../utils";
import { API_BASE_URL, DOKUMENTER } from "../../api-constants";

type DokumentOversiktResDto = DokumentOversikt[];

export const hentOversikt = (saksnummer: string): Promise<DokumentOversiktResDto> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/oversikt/${saksnummer}`);
