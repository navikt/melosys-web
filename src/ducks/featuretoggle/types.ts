import { ErrorResponse } from "melosys-api";

export const OK = "featuretoggle/OK";
export const FEILET = "featuretoggle/FEILET";
export const PENDING = "featuretoggle/PENDING";
export const RESET = "featuretoggle/RESET";

export interface Data {
  data?: ErrorResponse;
}

interface ResetAction {
  type: typeof RESET;
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

export type Action = ResetAction | FeiletAction | PendingAction | OkAction;
