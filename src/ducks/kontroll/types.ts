import { ErrorResponse } from "melosys-api";

export const OK = "kontroller/OK";
export const FEILET = "kontroller/FEILET";
export const PENDING = "kontroller/PENDING";

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
