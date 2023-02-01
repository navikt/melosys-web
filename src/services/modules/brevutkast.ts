import { KTObject } from "@navikt/melosys-kodeverk";
import { deleteAsJson, getAsJson, postAsJson, putAsJson } from "../utils";
import { API_BASE_URL, BREV } from "../api-constants";
import { OpprettBrevReqDto } from "./dokumenter-v2";

export type BrevutkastResDto = {
  utkastBrevID: number;
  lagretAvSaksbehandlerIdent: string;
  brevbestilling: OpprettBrevReqDto & {
    produserbardokument: KTObject;
  };
};

export const hentBrevutkast = (behandlingID: number): Promise<BrevutkastResDto[]> =>
  getAsJson(`${API_BASE_URL}${BREV}/utkast/${behandlingID}`);

export const lagreBrevutkast = (behandlingID: number, data: OpprettBrevReqDto) =>
  postAsJson(`${API_BASE_URL}${BREV}/utkast/${behandlingID}`, data);

export const oppdaterBrevutkast = (behandlingID: number, utkastID: number, data: OpprettBrevReqDto) =>
  putAsJson(`${API_BASE_URL}${BREV}/utkast/${behandlingID}/${utkastID}`, data);

export const slettBrevutkast = (behandlingID: number, utkastID: number) =>
  deleteAsJson(`${API_BASE_URL}${BREV}/utkast/${behandlingID}/${utkastID}`);
