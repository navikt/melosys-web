import * as Api from "../../services/api";

export const OK = "lovvalgsperioder/OK";
export const FEILET = "lovvalgsperioder/FEILET";
export const PENDING = "lovvalgsperioder/PENDING";
export const RESET = "lovvalgsperioder/RESET";
export const OK_OPPDATER_LOVVALGSPERIODE = "lovvalgsperioder/OK_OPPDATER_LOVVALGSPERIODE";
export const OK_SLETT_LOVVALGSPERIODE = "lovvalgsperioder/OK_SLETT_LOVVALGSPERIODE";
export const OPPDATER_LOVVALGSPERIODER = "lovvalgsperioder/OPPDATER_LOVVALGSPERIODER";
export const ENDRE_PERIODE = "lovvalgsperioder/ENDRE_PERIODE";

export interface ResetAction {
  type: typeof RESET;
}

interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

interface PendingAction {
  type: typeof PENDING;
}

export interface OkAction {
  type: typeof OK;
  data: Api.Lovvalgsperioder.Lovvalgsperiode[];
}

export interface OppdaterLovvalgsperioderAction {
  type: typeof OPPDATER_LOVVALGSPERIODER;
  data: Api.Lovvalgsperioder.Lovvalgsperiode[];
}

export interface OkOppdaterLovvalgsperiodeAction {
  type: typeof OK_OPPDATER_LOVVALGSPERIODE;
  data: Api.Lovvalgsperioder.Lovvalgsperiode;
}

export interface OkSlettLovvalgsperiodeAction {
  type: typeof OK_SLETT_LOVVALGSPERIODE;
  data: {
    periodeID: number;
  };
}

export interface EndrePeriodeAction {
  type: typeof ENDRE_PERIODE;
  data: {
    fomDato: string;
    tomDato?: string;
  };
}
export type Action =
  | ResetAction
  | FeiletAction
  | PendingAction
  | OkAction
  | EndrePeriodeAction
  | OkOppdaterLovvalgsperiodeAction
  | OkSlettLovvalgsperiodeAction
  | OppdaterLovvalgsperioderAction;
