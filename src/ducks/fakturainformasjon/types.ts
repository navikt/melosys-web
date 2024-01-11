export const OK = "fakturainformasjon/OK";
export const FEILET = "fakturainformasjon/FEILET";
export const PENDING = "fakturainformasjon/PENDING";
export const RESET = "fakturainformasjon/RESET";

export interface Data {
  fakturaserie?: any;
  fakturainfo?: any;
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

interface ResetAction {
  type: typeof RESET;
}

export type Action = FeiletAction | PendingAction | OkAction | ResetAction;
