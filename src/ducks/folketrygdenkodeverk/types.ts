import { KTObject } from '@navikt/melosys-kodeverk';

export const OK = 'folketrygdenkodeverk/OK';
export const FEILET = 'folketrygdenkodeverk/FEILET';
export const PENDING = 'folketrygdenkodeverk/PENDING';

export interface Data {
  trygdedekninger?: KTObject[]
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
  data: Data,
}

export type Action = FeiletAction | PendingAction | OkAction;
