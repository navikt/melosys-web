import { getAsJson, deleteAsJson, postAsJson } from "../../utils";
import { API_BASE_URL, FAGSAKER } from "../../api-constants";

export interface HentResDto {
  kontaktorgnr: string | null;
  kontaktnavn: string | null;
}

export const hent = (saksnr: string, juridiskorgnr: string): Promise<HentResDto> =>
  getAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/kontaktopplysninger/${juridiskorgnr}`);

export interface SendReqDto {
  kontaktorgnr: string | null;
  kontaktnavn: string | null;
}

export const send = (saksnr: string, juridiskorgnr: string, data: SendReqDto) =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/kontaktopplysninger/${juridiskorgnr}`, data);

export const slett = (saksnr: string, juridiskorgnr: string) =>
  deleteAsJson(`${API_BASE_URL}${FAGSAKER}/${saksnr}/kontaktopplysninger/${juridiskorgnr}`);
