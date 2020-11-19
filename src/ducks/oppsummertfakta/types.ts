export const OK = 'oppsummertfakta/OK';
export const FEILET = 'oppsummertfakta/FEILET';
export const PENDING = 'oppsummertfakta/PENDING';
export const OPPDATER_OPPSUMMERTFAKTA = 'oppsummertfakta/OPPDATER_OPPSUMMERTFAKTA';

export type Data = {
  virksomheter?: string[]
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
  data: any,
}


export interface OppdaterAction {
  type: typeof OPPDATER_OPPSUMMERTFAKTA,
  data: Data
}

export type Action = FeiletAction | PendingAction | OkAction | OppdaterAction ;
