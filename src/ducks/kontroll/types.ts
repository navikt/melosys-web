import { videresendingTypes } from "../videresending";
import { anmodningunntakTypes } from "../anmodningunntak";
import { utpekTypes } from "../utpek";
import { vedtakTypes } from "../vedtak";
import { fagsakTypes } from "../fagsaker";

export const OK = "kontroller/OK";
export const OPPDATER_KONTROLLFEIL = "kontroller/OPPDATER_KONTROLLFEIL";
export const FEILET = "kontroller/FEILET";
export const PENDING = "kontroller/PENDING";
export const RESET = "kontroller/RESET";

export interface Data {
  kontrollfeilList?: {
    kode: string;
    felter: string[];
    type: string;
  }[];
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

interface OppdaterKontrollFeilAction {
  type: typeof OPPDATER_KONTROLLFEIL;
  data: Data;
}

interface ResetAction {
  type: typeof RESET;
}

export type Action =
  | utpekTypes.Action
  | vedtakTypes.Action
  | videresendingTypes.Action
  | anmodningunntakTypes.Action
  | fagsakTypes.Action
  | FeiletAction
  | PendingAction
  | OkAction
  | OppdaterKontrollFeilAction
  | ResetAction;
