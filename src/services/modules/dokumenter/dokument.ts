import { DokumentOversikt } from "Domene";

import { getAsJson, postAsJson } from "../../utils";
import { API_BASE_URL, DOKUMENTER } from "../../api-constants";

export type BrevbestillingReqDto = {
  mottaker: string | null;
  fritekst: string | null;
  begrunnelseKode: string | null;
};
export const opprett = (behandlingID: number, produserbartDokument: string, dokument: BrevbestillingReqDto) =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/opprett/${behandlingID}/${produserbartDokument}`, dokument);

type DokumentOversiktResDto = DokumentOversikt[];
export const hentOversikt = (saksnummer: string): Promise<DokumentOversiktResDto> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/oversikt/${saksnummer}`);
