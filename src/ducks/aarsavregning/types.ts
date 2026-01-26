import { AarsavregningResponse } from "../../services/modules/aarsavregning/aarsavregning";

export const OK = "aarsavregning/OK";
export const RESET = "aarsavregning/RESET";
export const SET_ER_NY_VURDERING = "aarsavregning/SET_ER_NY_VURDERING";

export interface AarsavregningState {
  status: string;
  data: AarsavregningResponse | Record<string, never>;
  erNyVurdering: boolean;
}

interface OkAction {
  type: typeof OK;
  data: any;
}

interface ResetAction {
  type: typeof RESET;
}

interface SetErNyVurderingAction {
  type: typeof SET_ER_NY_VURDERING;
  erNyVurdering: boolean;
}

export type Action = OkAction | ResetAction | SetErNyVurderingAction;
