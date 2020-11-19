import { Virksomheter } from '../../@types/avklartfakta';

export const OK = 'oppsummertfakta/OK';
export const FEILET = 'oppsummertfakta/FEILET';
export const PENDING = 'oppsummertfakta/PENDING';
export const OPPDATER_OPPSUMMERTFAKTA = 'oppsummertfakta/OPPDATER_OPPSUMMERTFAKTA';
export const OPPDATER_VIRKSOMHETER = 'oppsummertfakta/OPPDATERVIRKSOMHETER';

export type Data = {
  virksomheter?: Virksomheter
}

export interface FeiletAction {
  type: typeof FEILET,
  data: any,
}

export interface PendingAction {
  type: typeof PENDING,
}

export interface OkAction {
  type: typeof OK,
  data: Data,
}

export interface OppdaterVirksomheterAction {
  type: typeof OPPDATER_VIRKSOMHETER,
  data: Virksomheter
}

export interface OppdaterOppsummertfaktaAction {
  type: typeof OPPDATER_OPPSUMMERTFAKTA,
  data: Data
}

export type Action = FeiletAction | PendingAction | OkAction | OppdaterOppsummertfaktaAction | OppdaterVirksomheterAction;
