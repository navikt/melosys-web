import { KTObject } from "@navikt/melosys-kodeverk";

export const OK = "behandlingstema/OK";
export const FEILET = "behandlingstema/FEILET";
export const PENDING = "behandlingstema/PENDING";

export const HENT_MULIGE_BEHANDLINGSTEMA = "behandlingstema/HENT_MULIGE_BEHANDLINGSTEMA";

export interface Data {
  muligeBehandlingstema?: KTObject[];
}

interface HentMuligeBehandlingstemaAction {
  type: typeof HENT_MULIGE_BEHANDLINGSTEMA;
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

export type Action = HentMuligeBehandlingstemaAction | FeiletAction | PendingAction | OkAction;
