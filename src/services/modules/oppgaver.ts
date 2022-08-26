import { getAsJson, cachedGetAsJson, postAsJson } from "../utils";
import { API_BASE_URL, OPPGAVER } from "../api-constants";
import * as KV from "../../kodeverk";

export interface PlukkOppgaveReqDto {
  sakstype: string;
  sakstema: string;
  behandlingstema: string;
}

export interface TilbakeleggOppgaveReqDto {
  behandlingID: number;
  begrunnelse: null;
  venterPaaDokumentasjon: boolean;
}

export interface SokOppgaveResDto {
  tema: keyof typeof KV.Koder.Tema;
  oppgavetype?: string;
  registrertDato?: string;
  frist?: string;
  sakID?: string;
  oppgaveID?: string;
  journalpostID?: string;
}

export const oversikt = () => getAsJson(`${API_BASE_URL}${OPPGAVER}/oversikt`);

export const sendPlukk = (data: PlukkOppgaveReqDto) => postAsJson(`${API_BASE_URL}${OPPGAVER}/plukk`, data);

export const tilbakelegg = (data: TilbakeleggOppgaveReqDto) =>
  postAsJson(`${API_BASE_URL}${OPPGAVER}/tilbakelegg`, data);

export const sok = (
  personIdent: string | null,
  orgnr: string | null,
  cacheDuration = 30
): Promise<Array<SokOppgaveResDto>> =>
  cachedGetAsJson(
    `${API_BASE_URL}${OPPGAVER}/sok?personIdent=${personIdent || ""}&orgnr=${orgnr || ""}`,
    cacheDuration
  );
