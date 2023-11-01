export const OK = "trygdeavgift/OK";
export const FEILET = "trygdeavgift/FEILET";
export const PENDING = "trygdeavgift/PENDING";
export const RESET = "trygdeavgift/RESET";

export interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

export interface PendingAction {
  type: typeof PENDING;
}

export interface OkAction {
  type: typeof OK;
  data: any;
}

export interface ResetAction {
  type: typeof RESET;
}

export type Action = FeiletAction | PendingAction | OkAction | ResetAction;
