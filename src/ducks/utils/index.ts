import { ErrorResponse } from 'melosys-api';

import { STATUS } from '../../services/utils';

export const hentFeilkoder = (res: ErrorResponse | undefined, status: string) => {
  if (res && res.feilkoder && status === STATUS.ERROR) {
    return res.feilkoder;
  }
  return [];
};

export const harFeilkode = (data: any) => data.feilkoder && data.feilkoder.length > 0;

export const harFeilmelding = (data: any) => data.message;
