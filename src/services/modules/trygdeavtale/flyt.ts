import { KTObject } from "@navikt/melosys-kodeverk";
import { deleteAsJson, getAsJson, putAsJson } from "../../utils";
import { TRYGDEAVTALE_FLYT_BASE_URL } from "../../api-constants";
import { StegNavn } from "../../../kodeverk/koder";

export interface Virksomhet {
  orgId: string;
  navn: string;
}

export interface Resultat {
  fom?: string;
  tom?: string;
  land?: string[];
  virksomheter?: string[];
  vedtakValg?: string;
  innvilgelseValg?: string;
  bestemmelseValg?: string;
}

export interface Steg {
  navn: StegNavn;
  status: string;
  nummer: number;
}

export interface StegData {
  virksomheter?: Virksomhet[];
  vedtakValg?: KTObject[];
  innvilgelseValg?: KTObject[];
  bestemmelseValg?: KTObject[];
  barn?: string[];
  ektefelle?: string;
}

export type FlytResDto = {
  steg: Steg[];
  resultat: Resultat;
  data: StegData;
};

export interface FlytReqDto {
  resultat: Resultat;
}

export const hentFlyt = (behandlingID: number): Promise<FlytResDto> =>
  getAsJson(`${TRYGDEAVTALE_FLYT_BASE_URL}${behandlingID}`);

export const sendFlyt = (behandlingID: number, data: FlytReqDto): Promise<FlytResDto> =>
  putAsJson(`${TRYGDEAVTALE_FLYT_BASE_URL}${behandlingID}`, data);

export const slettFlyt = (behandlingID: number) => deleteAsJson(`${TRYGDEAVTALE_FLYT_BASE_URL}${behandlingID}`);
