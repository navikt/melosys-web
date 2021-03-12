import { KTObject } from "@navikt/melosys-kodeverk";

export const OK = "behandlingsstatus/OK";
export const FEILET = "behandlingsstatus/FEILET";
export const PENDING = "behandlingsstatus/PENDING";

export const HENT_MULIGE_BEHANDLINGSSTATUSER = "behandlingstatus/HENT_MULIGE_BEHANDLINGSSTATUSER";

export interface Data {
  muligeBehandlingsstatuser?: KTObject[];
}

interface HentMuligeBehandlingsstatuserAction {
  type: typeof HENT_MULIGE_BEHANDLINGSSTATUSER;
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

export type Action = HentMuligeBehandlingsstatuserAction | FeiletAction | PendingAction | OkAction;
