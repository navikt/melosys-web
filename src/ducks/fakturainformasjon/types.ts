export const OK = "fakturainformasjon/OK";
export const FEILET = "fakturainformasjon/FEILET";
export const PENDING = "fakturainformasjon/PENDING";

export interface Data {
  fakturaserie?: any;
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
