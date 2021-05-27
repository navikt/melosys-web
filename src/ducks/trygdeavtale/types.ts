import { StegDataResDto } from "../../services/modules/trygdeavtale/flyt";

export const OK = "trygdeavtale/OK";
export const FEILET = "trygdeavtale/FEILET";
export const PENDING = "trygdeavtale/PENDING";

export type Data = StegDataResDto;

interface FeiletAction {
  type: typeof FEILET;
  data: any;
}

interface PendingAction {
  type: typeof PENDING;
}

interface OkAction {
  type: typeof OK;
  data: Data;
}

export type Action = FeiletAction | PendingAction | OkAction;
