import { createSelector, Selector } from 'reselect';
import { STATUS } from '../../services/utils';
import * as Types from './types';

const VideresendingSelector: Selector<any, Types.State> = createSelector(
  state => state.videresending,
  Videresending => Videresending
);

const ReduxStatusSelector = createSelector(
  VideresendingSelector,
  Videresending => Videresending.status
);

const VideresendingDataSelector = createSelector(
  VideresendingSelector,
  Videresending => Videresending.data
);

const HttpStatusSelector = createSelector(
  VideresendingDataSelector,
  VideresendingData => VideresendingData.status
);

const HttpMessageSelector = createSelector(
  VideresendingDataSelector,
  VideresendingData => VideresendingData.message
);

export const FeilmeldingSelector = createSelector(
  ReduxStatusSelector,
  HttpStatusSelector,
  HttpMessageSelector,
  (reduxStatus, httpStatus, httpMessage) => {
    if (reduxStatus === STATUS.ERROR) {
      if (httpStatus && httpStatus < 500) {
        return [{
          tittel: 'Feil ved videresending',
          innhold: httpMessage,
        }];
      } else {
        return [{
          tittel: 'Teknisk feil',
          innhold: 'Det oppsto en teknisk feil ved videresending. Ta kontakt med brukerstøtte dersom problemet oppstår gjentatte ganger.',
        }];
      }
    }
    return [];
  }
);
