import { postAsJson } from "../../utils";
import { API_BASE_URL, FAGSAKER } from "../../api-constants";
import { FagsakOppsummering } from "../types";

export interface SokRequestDto {
  ident: string | null;
  saksnummer: string | null;
  orgnr: string | null;
}

export const send = (data: SokRequestDto): Promise<FagsakOppsummering[]> =>
  postAsJson(`${API_BASE_URL}${FAGSAKER}/sok`, data);
