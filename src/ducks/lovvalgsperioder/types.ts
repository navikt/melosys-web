export const OK = "lovvalgsperioder/OK";
export const FEILET = "lovvalgsperioder/FEILET";
export const PENDING = "lovvalgsperioder/PENDING";
export const RESET = "lovvalgsperioder/RESET";
export const OPPDATER_LOVVALGSPERIODER = "lovvalgsperioder/OPPDATER_LOVVALGSPERIODER";
export const ENDRE_PERIODE = "lovvalgsperioder/ENDRE_PERIODE";

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

interface OppdaterLovvalgsperioderAction {
  type: typeof OPPDATER_LOVVALGSPERIODER;
  data: any;
}

interface EndrePeriodeAction {
  type: typeof ENDRE_PERIODE;
  data: any;
}
export type Action =
  | ResetAction
  | FeiletAction
  | PendingAction
  | OkAction
  | EndrePeriodeAction
  | OppdaterLovvalgsperioderAction;
