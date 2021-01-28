import { OppsummertFaktaVirksomheter, MedfolgendeFamiliemedlem } from "Domene";

export const OK = "oppsummertfakta/OK";
export const FEILET = "oppsummertfakta/FEILET";
export const PENDING = "oppsummertfakta/PENDING";
export const OPPDATER_OPPSUMMERTFAKTA = "oppsummertfakta/OPPDATER_OPPSUMMERTFAKTA";
export const OPPDATER_VIRKSOMHETER = "oppsummertfakta/OPPDATER_VIRKSOMHETER";

export const RESET = "oppsummertfakta/RESET";

export type Data = {
  virksomheter?: OppsummertFaktaVirksomheter;
  medfolgendeFamilie?: MedfolgendeFamiliemedlem[];
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
  data: Data;
}

export interface ResetAction {
  type: typeof RESET;
}

export interface OppdaterVirksomheterAction {
  type: typeof OPPDATER_VIRKSOMHETER;
  data: OppsummertFaktaVirksomheter;
}

export interface OppdaterOppsummertfaktaAction {
  type: typeof OPPDATER_OPPSUMMERTFAKTA;
  data: Data;
}

export type Action =
  | FeiletAction
  | PendingAction
  | OkAction
  | ResetAction
  | OppdaterOppsummertfaktaAction
  | OppdaterVirksomheterAction;
