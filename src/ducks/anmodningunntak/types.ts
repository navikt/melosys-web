import { ErrorResponse } from 'melosys-api';

export const OK = 'anmodningunntak/OK';
export const FEILET = 'anmodningunntak/FEILET';
export const PENDING = 'anmodningunntak/PENDING';
export const RESET = 'anmodningunntak/RESET';

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
