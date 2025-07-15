import { API_BASE_URL, IVERKSETT, SAKSFLYT, TRYGDEAVGIFT } from "../../api-constants";
import { postAsJson } from "../../utils";

export interface IverksettReqDto {
  behandlingsresultatTypeKode: string;
  vedtakstype: string | null;
}

export const iverksettPensjonist = (behandlingID: number, data: IverksettReqDto) =>
  postAsJson(`${API_BASE_URL}${SAKSFLYT}/${IVERKSETT}/${TRYGDEAVGIFT}/${behandlingID}/pensjonist`, data);
