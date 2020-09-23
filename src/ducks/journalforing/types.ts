import { ErrorResponse } from 'melosys-api';

export const OK = 'journalforing/OK';
export const FEILET = 'journalforing/FEILET';
export const PENDING = 'journalforing/PENDING';
export const RESET = 'journalforing/RESET';

export interface Data {
  data?: ErrorResponse,
}

interface ResetAction {
  type: typeof RESET,
}

interface FeiletAction {
  type: typeof FEILET,
  data: any,
}

interface PendingAction {
  type: typeof PENDING,
}

interface OkAction {
  type: typeof OK,
  data: any,
}

export type Action = ResetAction | FeiletAction | PendingAction | OkAction;
