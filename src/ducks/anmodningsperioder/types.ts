import * as Api from "../../services/api";

export const OK = "anmodningsperioder/OK";
export const FEILET = "anmodningsperioder/FEILET";
export const PENDING = "anmodningsperioder/PENDING";

export const OPPDATER_ANMODNINGSPERIODER = "anmodningsperioder/OPPDATER_ANMODNINGSPERIODER";

export const RESET = "anmodningsperioder/RESET";

export interface ResetAction {
  type: typeof RESET;
}

interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

interface PendingAction {
  type: typeof PENDING;
}

export interface OkAction {
  type: typeof OK;
  data: Api.Anmodningsperioder.Anmodningsperioder;
}

export interface OppdaterAnmodningsperioderAction {
  type: typeof OPPDATER_ANMODNINGSPERIODER;
  anmodningsperioder: Api.Anmodningsperioder.Anmodningsperiode[];
}

export type Action = ResetAction | FeiletAction | PendingAction | OkAction | OppdaterAnmodningsperioderAction;
