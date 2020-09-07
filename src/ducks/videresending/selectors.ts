import { createSelector, Selector } from 'reselect';
import { RootState, StateSection } from 'AppTypes';

import { STATUS } from '../../services/utils';
import * as Types from './types';

const VideresendingSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  state => state.videresending,
  videresending => videresending
);

const ReduxStatusSelector = createSelector(
  VideresendingSelector,
  videresending => videresending.status
);

const VideresendingDataSelector = createSelector(
  VideresendingSelector,
  videresending => videresending.data
);

const HttpResponsDataSelector = createSelector(
  VideresendingDataSelector,
  videresendingData => videresendingData.data
);

const HttpStatusSelector = createSelector(
  HttpResponsDataSelector,
  httpResponsData => httpResponsData && httpResponsData.status
);

const HttpMessageSelector = createSelector(
  HttpResponsDataSelector,
  httpResponsData => httpResponsData && httpResponsData.message
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
      }
      return [{
        tittel: 'Teknisk feil',
        innhold: 'Det oppsto en teknisk feil ved videresending. Ta kontakt med brukerstøtte dersom problemet oppstår gjentatte ganger.',
      }];
    }
    return [];
  }
);
