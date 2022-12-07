import { KTObject } from "@navikt/melosys-kodeverk";
import { deleteAsJson, getAsJson, putAsJson } from "../../utils";
import { TRYGDEAVTALE_FLYT_BASE_URL } from "../../api-constants";
import { StegNavn } from "../../../kodeverk/koder";

export interface Virksomhet {
  orgId: string;
  navn: string;
}

export type Familiemedlem = {
  uuid: string;
  omfattet?: boolean;
  begrunnelseKode: string | null;
  begrunnelseFritekst: string | null;
};

export interface Resultat {
  virksomhet?: string;
  vedtak?: string;
  bestemmelse?: string;
  tilleggsbestemmelse?: string;
  barn?: Familiemedlem[] | null;
  ektefelle?: Familiemedlem | null;
  lovvalgsperiodeFom?: string;
  lovvalgsperiodeTom?: string;
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
  nyVurderingBakgrunn?: string;
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
  periodeFom?: string;
  periodeTom?: string | null;
  soeknadsland?: KTObject;
  landValg: KTObject[];
  landValgUtenStøtte: KTObject[];
  virksomheter?: Virksomhet[];
  vedtakValg?: KTObject[];
  bestemmelseValg?: KTObject[];
  tilleggsbestemmelseValg?: KTObject;
  barnValg?: FamilieValg[];
  barnBegrunnelseValg?: KTObject[];
  ektefelleValg?: FamilieValg;
  ektefelleBegrunnelseValg?: KTObject[];
}

export type FlytResDto = {
  steg: Steg[];
  resultat: Resultat;
  data: StegData;
};

export const hentFlyt = (behandlingID: number): Promise<FlytResDto> =>
  getAsJson(`${TRYGDEAVTALE_FLYT_BASE_URL}${behandlingID}`);

export const sendFlyt = (behandlingID: number, resultat: Resultat): Promise<FlytResDto> =>
  putAsJson(`${TRYGDEAVTALE_FLYT_BASE_URL}${behandlingID}`, { resultat });

export const oppfriskFlyt = (behandlingID: number) =>
  putAsJson(`${TRYGDEAVTALE_FLYT_BASE_URL}${behandlingID}/oppfrisk`);

export const slettFlyt = (behandlingID: number) => deleteAsJson(`${TRYGDEAVTALE_FLYT_BASE_URL}${behandlingID}`);
