import { DokumentOversikt } from 'Domene';

export const OK = 'dokumenter/OK';
export const FEILET = 'dokumenter/FEILET';
export const PENDING = 'dokumenter/PENDING';
export const RESET = 'dokumenter/RESET';

export interface Data {
  dokumentOversikt?: DokumentOversikt[]
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
