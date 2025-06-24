export const OK = "HelseutgiftDekkesPeriode/OK";
export const FEILET = "HelseutgiftDekkesPeriode/FEILET";
export const PENDING = "HelseutgiftDekkesPeriode/PENDING";

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
