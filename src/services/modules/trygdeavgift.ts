import { getAsJson, putAsJson } from "../utils";
import { API_BASE_URL, TRYGDEAVGIFT } from "../api-constants";
import { KTObject } from "@navikt/melosys-kodeverk";

export type Inntektskilde = {
  type: string;
  arbeidsgiversavgiftBetales: boolean;
  avgiftspliktigInntektMnd?: number;
  fomDato: string;
  tomDato: string;
};

export type Skatteforhold = {
  fomDato: string;
  tomDato: string;
  skatteplikttype: string;
};

export type TrygdeavgiftsgrunnlagDto = {
  skatteforholdsperioder: Skatteforhold[];
  inntektskilder: Inntektskilde[];
  sluttdatoKanVæreÅpen?: boolean;
};

export type TrygdeavgiftMottakerDto = {
  trygdeavgiftMottaker: KTObject;
};

export const hentTrygdeavgiftsgrunnlaget = (behandlingID: number): Promise<TrygdeavgiftsgrunnlagDto> =>
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/grunnlag`);

export const hentTrygdeavgiftMottaker = (behandlingID: number): Promise<TrygdeavgiftMottakerDto> =>
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/mottaker`);

export const oppdaterTrygdeavgiftsgrunnlag = (
  behandlingID: number,
  grunnlag: TrygdeavgiftsgrunnlagDto
): Promise<TrygdeavgiftsgrunnlagDto> =>
  putAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/grunnlag`, grunnlag);

export type Trygdeavgiftsperiode = {
  fom: string;
  tom: string;
  trygdedekning: string;
  inntektskildetype: string;
  avgiftssats: number;
  avgiftPerMd: number;
};

export type BeregnetTrygdeavgift = {
  trygdeavgiftsperioder: Trygdeavgiftsperiode[];
};

export type Fakturamottaker = {
  navn: string;
};

export const hentBeregnetTrygdeavgift = (behandlingID: number): Promise<BeregnetTrygdeavgift> =>
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`);

export const beregnTrygdeavgift = (behandlingID: number): Promise<BeregnetTrygdeavgift> =>
  putAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/beregning`);

export const hentFakturamottaker = (behandlingID: number): Promise<Fakturamottaker> =>
  getAsJson(`${API_BASE_URL}/behandlinger/${behandlingID}/${TRYGDEAVGIFT}/fakturamottaker`);
