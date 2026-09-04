import * as Api from "../../services/api";
import { KTObject } from "@navikt/melosys-kodeverk";

export const OK = "oppsummertfakta/OK";
export const FEILET = "oppsummertfakta/FEILET";
export const PENDING = "oppsummertfakta/PENDING";
export const RESET = "oppsummertfakta/RESET";

export interface Data {
  virksomheter?: Api.Avklartefakta.Virksomheter;
  fullstendigManglendeInnbetaling?: boolean;
  manglendeInnbetalingVurdering?: KTObject;
  ikkeYrkesaktivFamilieRelasjonstype?: string;
  ikkeYrkesaktivOppholdstype?: string;
  arbeidssituasjonType?: string;
  ukjentSluttdatoMedlemskapsperiode?: boolean;
}

export interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

export interface PendingAction {
  type: typeof PENDING;
}

export interface OkAction {
  type: typeof OK;
  data: Data;
}

export interface ResetAction {
  type: typeof RESET;
}

export type Action = FeiletAction | PendingAction | OkAction | ResetAction;
