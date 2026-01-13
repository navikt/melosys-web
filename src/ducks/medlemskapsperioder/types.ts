import { Avgiftspliktigperiode } from "../../services/modules/types/periodeTyper";

export const OK_MEDLEMSKAPSPERIODE = "medlemskapsperioder/OK";
export const OK_OPPRETT_MEDLEMSKAPSPERIODE = "medlemskapsperioder/OK_OPPRETT";
export const OK_OPPDATER_MEDLEMSKAPSPERIODE = "medlemskapsperioder/OK_OPPDATER";
export const OK_SLETT_MEDLEMSKAPSPERIODE = "medlemskapsperioder/OK_SLETT";
export const OK_SLETT_ALLE_MEDLEMSKAPSPERIODER = "medlemskapsperioder/OK_SLETT_ALLE";
export const FEILET = "medlemskapsperioder/FEILET";
export const PENDING = "medlemskapsperioder/PENDING";
export const RESET = "medlemskapsperioder/RESET";

export interface Data {
  medlemskapsperioder?: Avgiftspliktigperiode[];
}

export interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

export interface PendingAction {
  type: typeof PENDING;
}

export interface ResetAction {
  type: typeof RESET;
}

export interface OkMedlemskapsperiodeAction {
  type: typeof OK_MEDLEMSKAPSPERIODE;
  data: Avgiftspliktigperiode[];
}

export interface OkOpprettMedlemskapsperiodeAction {
  type: typeof OK_OPPRETT_MEDLEMSKAPSPERIODE;
  data: Avgiftspliktigperiode;
}

export interface OkOppdaterMedlemskapsperiodeAction {
  type: typeof OK_OPPDATER_MEDLEMSKAPSPERIODE;
  data: Avgiftspliktigperiode;
}

export interface OkSlettMedlemskapsperiodeAction {
  type: typeof OK_SLETT_MEDLEMSKAPSPERIODE;
  data: {
    id: number;
  };
}

export interface OkSlettAlleMedlemskapsperioderAction {
  type: typeof OK_SLETT_ALLE_MEDLEMSKAPSPERIODER;
}

export type Action =
  | FeiletAction
  | PendingAction
  | ResetAction
  | OkMedlemskapsperiodeAction
  | OkOpprettMedlemskapsperiodeAction
  | OkOppdaterMedlemskapsperiodeAction
  | OkSlettMedlemskapsperiodeAction
  | OkSlettAlleMedlemskapsperioderAction;
