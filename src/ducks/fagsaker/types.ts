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

export const HENTET_MULIGE_SAKSTEMA = "fagsaker/HENTET_MULIGE_SAKSTEMA";
export const HENTET_MULIGE_SAKSTYPE = "fagsaker/HENTET_MULIGE_SAKSTYPE";

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

interface HentetMuligeSakstemaAction {
  type: typeof HENTET_MULIGE_SAKSTEMA;
  data: any;
}

interface HentetMuligeSakstypeAction {
  type: typeof HENTET_MULIGE_SAKSTYPE;
  data: any;
}

export type Action = HentetMuligeSakstemaAction | HentetMuligeSakstypeAction | FeiletAction | PendingAction | OkAction;
