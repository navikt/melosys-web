import { postAsJson } from "../../utils";
import { API_BASE_URL, FAGSAKER } from "../../api-constants";
import { FagsakOppsummering } from "../types";

export interface SokRequestDto {
  ident: string | null;
  saksnummer: string | null;
  orgnr: string | null;
}

export const send = (data: SokRequestDto, aktiveBehandlinger?: boolean): Promise<FagsakOppsummering[]> => {
  const url =
    aktiveBehandlinger !== undefined
      ? `${API_BASE_URL}${FAGSAKER}/sok?aktiveBehandlinger=${aktiveBehandlinger}`
      : `${API_BASE_URL}${FAGSAKER}/sok`;

  return postAsJson(url, data);
};
