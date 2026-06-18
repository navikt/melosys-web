import type { PensjonsopptjeningRespons } from "../../services/modules/pensjonsopptjening/pensjonsopptjening";

export const OK = "pensjonsopptjening/OK";
export const FEILET = "pensjonsopptjening/FEILET";
export const PENDING = "pensjonsopptjening/PENDING";
export const RESET = "pensjonsopptjening/RESET";

export type {
  PensjonsopptjeningKilde,
  PensjonsopptjeningPeriode,
  PensjonsopptjeningRespons,
} from "../../services/modules/pensjonsopptjening/pensjonsopptjening";

interface FeiletAction {
  type: typeof FEILET;
  data: unknown;
}

interface PendingAction {
  type: typeof PENDING;
}

interface OkAction {
  type: typeof OK;
  data: PensjonsopptjeningRespons;
}

interface ResetAction {
  type: typeof RESET;
}

export type Action = FeiletAction | PendingAction | OkAction | ResetAction;
