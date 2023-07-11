import * as Api from "../../services/api";

export const OK = "lovvalgsperioder/OK";
export const FEILET = "lovvalgsperioder/FEILET";
export const PENDING = "lovvalgsperioder/PENDING";
export const RESET = "lovvalgsperioder/RESET";
export const OPPDATER_LOVVALGSPERIODE = "lovvalgsperioder/OPPDATER_LOVVALGSPERIODE";
export const SLETT_LOVVALGSPERIODE = "lovvalgsperioder/SLETT_LOVVALGSPERIODE";
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
  data: Api.Lovvalgsperioder.Lovvalgsperiode[];
}

interface OppdaterLovvalgsperioderAction {
  type: typeof OPPDATER_LOVVALGSPERIODER;
  data: Api.Lovvalgsperioder.Lovvalgsperiode[];
}

interface OppdaterLovvalgsperiodeAction {
  type: typeof OPPDATER_LOVVALGSPERIODE;
  data: Api.Lovvalgsperioder.Lovvalgsperiode;
}

interface SlettLovvalgsperiodeAction {
  type: typeof SLETT_LOVVALGSPERIODE;
  data: {
    periodeID: number;
  };
}

interface EndrePeriodeAction {
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
  | OppdaterLovvalgsperiodeAction
  | SlettLovvalgsperiodeAction
  | OppdaterLovvalgsperioderAction;
