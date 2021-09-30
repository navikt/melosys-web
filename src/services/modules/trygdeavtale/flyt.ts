import { KTObject } from "@navikt/melosys-kodeverk";
import { deleteAsJson, getAsJson, putAsJson } from "../../utils";
import { TRYGDEAVTALE_FLYT_BASE_URL } from "../../api-constants";
import { StegNavn } from "../../../kodeverk/koder";
import { MedfolgendeFamiliemedlem } from "../avklartefakta";

export interface Virksomhet {
  orgId: string;
  navn: string;
}

export interface Resultat {
  fom?: string;
  tom?: string | null;
  land?: string[];
  virksomheter?: string[];
  vedtak?: string;
  innvilgelse?: string;
  bestemmelse?: string;
  barn?: MedfolgendeFamiliemedlem[];
  ektefelle?: MedfolgendeFamiliemedlem;
}

export interface Steg {
  navn: StegNavn;
  status: string;
  nummer: number;
}

export interface FamilieValg {
  uuid: string;
  fnr: string | null;
  navn: string;
}

export interface StegData {
  virksomheter?: Virksomhet[];
  vedtakValg?: KTObject[];
  innvilgelseValg?: KTObject[];
  bestemmelseValg?: KTObject[];
  bestemmelseTekst?: string;
  barn?: FamilieValg[];
  barnBegrunnelseValg?: KTObject[];
  ektefelle?: FamilieValg;
  ektefelleBegrunnelseValg?: KTObject[];
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
