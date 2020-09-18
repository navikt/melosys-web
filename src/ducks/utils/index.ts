import { ErrorResponse } from 'melosys-api';

import { STATUS } from '../../services/utils';

export const hentFeilkoder = (res: ErrorResponse | undefined, reduxStatus: string) => {
  if (res && res.feilkoder && reduxStatus === STATUS.ERROR) {
    return res.feilkoder;
  }
  return [];
};

const hentFeilmelding = ({
  reduxStatus,
  httpStatus,
  httpMessage,
  stateName,
}: {
  reduxStatus: string,
  httpStatus: number | undefined,
  httpMessage: string | undefined,
  stateName: string,
}) => {
  if (reduxStatus === STATUS.ERROR) {
    if (httpStatus && httpStatus < 500) {
      return [{
        tittel: `Feil ved ${stateName}`,
        innhold: httpMessage,
      }];
    }
    return [{
      tittel: 'Teknisk feil',
      innhold: `Det oppsto en teknisk feil ved ${stateName}. Ta kontakt med brukerstøtte dersom problemet oppstår gjentatte ganger.`,
    }];
  }
  return [];
};

export const hentFeilmeldingByStateName = (stateName: string) => (
  (reduxStatus: string, httpStatus: number | undefined, httpMessage: string | undefined) => hentFeilmelding({
    reduxStatus,
    httpStatus,
    httpMessage,
    stateName,
  })
);

export const harFeilkode = (data: any) => data.feilkoder && data.feilkoder.length > 0;

export const harFeilmelding = (data: any) => data.message;
