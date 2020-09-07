import { postAsJson, putAsText } from '../../utils';
import { API_BASE_URL, SAKSFLYT, ANMODNINGSPERIODER } from '../../api-constants';

interface AnmodningOmUnntakBestillingDto {
  mottakerinstitusjon: string | null,
  fritekstSed: string | null,
}
export const bestill = (behandlingID: number, body: AnmodningOmUnntakBestillingDto) => postAsJson(`${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}/bestill`, body);

export const svar = (behandlingID: number) => putAsText(`${API_BASE_URL}${SAKSFLYT}/${ANMODNINGSPERIODER}/${behandlingID}/svar`);
