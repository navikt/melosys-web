/**
 * Types
 * ----------------------------------------------------------------------------------
 * Dette er action types som benyttes for å indikere hvordan fagsaker skal manipuleres
 * eller oppdateres.
 */
import { Avklartfakta } from 'Domene';

export const OK = 'avklartefakta/OK';
export const FEILET = 'avklartefakta/FEILET';
export const PENDING = 'avklartefakta/PENDING';
export const OPPDATER_AVKLARTEFAKTA = 'avklartefakta/OPPDATER_AVKLARTEFAKTA';

export const RESET = 'avklartefakta/RESET';

export type Data = Avklartfakta[] | {
  data: {
    status?: number,
    message?: string,
  },
};

export interface ResetAction {
  type: typeof RESET,
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

export interface OppdaterActionData {
  [key: string]: Avklartfakta[],
}

export interface OppdaterAction {
  type: typeof OPPDATER_AVKLARTEFAKTA,
  data: OppdaterActionData,
}

export type Action = ResetAction | FeiletAction | PendingAction | OkAction | OppdaterAction;
