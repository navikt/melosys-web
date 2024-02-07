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

export const HENT_MULIGE_SAKSTEMA = "fagsaker/HENT_MULIGE_SAKSTEMA";
export const HENT_MULIGE_SAKSTYPE = "fagsaker/HENT_MULIGE_SAKSTYPE";

export const HENT_FULLMEKTIG_HISTORIKK = "fagsaker/HENT_FULLMEKTIG_HISTORIKK";

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

interface HentMuligeSakstemaAction {
  type: typeof HENT_MULIGE_SAKSTEMA;
  data: any;
}

interface HentMuligeSakstypeAction {
  type: typeof HENT_MULIGE_SAKSTYPE;
  data: any;
}

interface HentFullmektigHistorikkAction {
  type: typeof HENT_FULLMEKTIG_HISTORIKK;
  data: any;
}

export type Action =
  | HentMuligeSakstemaAction
  | HentMuligeSakstypeAction
  | FeiletAction
  | PendingAction
  | OkAction
  | HentFullmektigHistorikkAction;
