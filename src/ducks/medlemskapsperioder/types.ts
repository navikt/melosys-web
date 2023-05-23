import { HentBestemmelseResponse, Medlemskapsperiode } from "../../services/modules/medlemskapsperioder";

export const OK_MEDLEMSKAPSPERIODE = "medlemskapsperioder/OK";
export const OK_BESTEMMELSE = "medlemskapsperioder/bestemmelse/OK";
export const FEILET = "medlemskapsperioder/FEILET";
export const PENDING = "medlemskapsperioder/PENDING";
export const RESET = "medlemskapsperioder/RESET";

export const OPPDATER_BESTEMMELSE = "medlemskapsperioder/OPPDATER_BESTEMMELSE";

export type Data = {
  bestemmelse?: string;
  medlemskapsperioder?: Medlemskapsperiode[];
};

export interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

export interface PendingAction {
  type: typeof PENDING;
}

export interface ResetAction {
  type: typeof RESET;
}

export interface OkMedlemskapsperiodeAction {
  type: typeof OK_MEDLEMSKAPSPERIODE;
  data: Medlemskapsperiode[];
}

export interface OkBestemmelseAction {
  type: typeof OK_BESTEMMELSE;
  data: HentBestemmelseResponse;
}

export interface OppdaterBestemmelseAction {
  type: typeof OPPDATER_BESTEMMELSE;
  data: string;
}

export type Action =
  | FeiletAction
  | PendingAction
  | ResetAction
  | OkMedlemskapsperiodeAction
  | OkBestemmelseAction
  | OppdaterBestemmelseAction;
