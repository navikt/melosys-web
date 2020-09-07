export const OK = 'videresending/OK';
export const FEILET = 'videresending/FEILET';
export const PENDING = 'videresending/PENDING';
export const RESET = 'videresending/RESET';

export interface Data {
  data?: {
    status?: number,
    message?: string,
  }
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
