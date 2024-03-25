export const OK = "sok/OK";
export const FEILET = "sok/FEILET";
export const PENDING = "sok/PENDING";

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
