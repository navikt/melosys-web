import { Medlemskapsperiode } from 'Domene';

export const OK = 'medlemskapsperioder/OK';
export const FEILET = 'medlemskapsperioder/FEILET';
export const PENDING = 'medlemskapsperioder/PENDING';

export type Data = Medlemskapsperiode[];

export interface FeiletAction {
  type: typeof FEILET,
  data: any,
}

export interface PendingAction {
  type: typeof PENDING,
}

export interface OkAction {
  type: typeof OK,
  data: Data,
}

export type Action = FeiletAction | PendingAction | OkAction;
