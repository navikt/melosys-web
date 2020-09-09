import { DokumentOversikt } from 'Domene';

import { getAsJson, postAsJson } from '../../utils';
import { API_BASE_URL, DOKUMENTER } from '../../api-constants';

export type BrevbestillingDto = {
  mottaker: string | null,
  fritekst: string | null,
  begrunnelseKode: string | null,
};
export const opprett = (behandlingID: number, produserbartDokument: string, dokument: BrevbestillingDto) =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/opprett/${behandlingID}/${produserbartDokument}`, dokument);

type DokumentOversiktDto = DokumentOversikt[];
export const hentOversikt = (saksnummer: string): Promise<DokumentOversiktDto> => getAsJson(`${API_BASE_URL}${DOKUMENTER}/oversikt/${saksnummer}`);
