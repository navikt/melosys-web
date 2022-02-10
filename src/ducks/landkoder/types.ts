import { KTObject } from "@navikt/melosys-kodeverk";

export const OK = "landkoder/OK";
export const FEILET = "landkoder/FEILET";
export const PENDING = "landkoder/PENDING";

export type Data = KTObject[];

interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

interface PendingAction {
  type: typeof PENDING;
}

interface OkAction {
  type: typeof OK;
  data: Data;
}

export type Action = FeiletAction | PendingAction | OkAction;
