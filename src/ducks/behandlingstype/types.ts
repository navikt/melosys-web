import { KTObject } from "@navikt/melosys-kodeverk";

export const OK = "behandlingstype/OK";
export const FEILET = "behandlingstype/FEILET";
export const PENDING = "behandlingstype/PENDING";

export const HENT_MULIGE_BEHANDLINGSTYPER = "behandlingstype/HENT_MULIGE_BEHANDLINGSTYPER";

export interface Data {
  muligeBehandlingstyper?: KTObject[];
}

interface HentMuligeBehandlingstyperAction {
  type: typeof HENT_MULIGE_BEHANDLINGSTYPER;
  data: any;
}

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

export type Action = HentMuligeBehandlingstyperAction | FeiletAction | PendingAction | OkAction;
