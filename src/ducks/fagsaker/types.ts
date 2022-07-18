/**
 * Types
 * ----------------------------------------------------------------------------------
 * Dette er action types som benyttes for å indikere hvordan fagsaker skal manipuleres
 * eller oppdateres.
 */

export const OK = "fagsaker/OK";
export const FEILET = "fagsaker/FEILET";
export const PENDING = "fagsaker/PENDING";

export const RESET = "fagsaker/RESET";

interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

interface PendingAction {
  type: typeof PENDING;
}

interface OkAction {
  type: typeof OK;
  data: any;
}

export type Action = FeiletAction | PendingAction | OkAction;
