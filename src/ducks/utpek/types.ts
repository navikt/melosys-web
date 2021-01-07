import { ErrorResponse } from "melosys-api";

export const OK = "utpek/OK";
export const FEILET = "utpek/FEILET";
export const PENDING = "utpek/PENDING";

export interface Data {
  data?: ErrorResponse;
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

export type Action = FeiletAction | PendingAction | OkAction;
