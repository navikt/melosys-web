import { Medlemskapsperiode } from "Domene";

export const OK = "medlemskapsperioder/OK";
export const FEILET = "medlemskapsperioder/FEILET";
export const PENDING = "medlemskapsperioder/PENDING";

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

export interface OkAction {
  type: typeof OK;
  data: Medlemskapsperiode[];
}

export interface OppdaterBestemmelseAction {
  type: typeof OPPDATER_BESTEMMELSE;
  data: string;
}

export type Action = FeiletAction | PendingAction | OkAction | OppdaterBestemmelseAction;
