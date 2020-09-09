import { createSelector, Selector } from 'reselect';
import { RootState, StateSection } from 'AppTypes';

import { STATUS } from '../../services/utils';
import * as Types from './types';

const AnmodningOmUnntakSelector: Selector<RootState, StateSection<Types.Data>> = createSelector(
  state => state.anmodningomunntak,
  anmodningOmUnntak => anmodningOmUnntak
);

const ReduxStatusSelector = createSelector(
  AnmodningOmUnntakSelector,
  anmodningOmUnntak => anmodningOmUnntak.status
);

const AnmodningOmUnntakDataSelector = createSelector(
  AnmodningOmUnntakSelector,
  anmodningOmUnntak => anmodningOmUnntak.data
);

const HttpResponsDataSelector = createSelector(
  AnmodningOmUnntakDataSelector,
  anmodningOmUnntakData => anmodningOmUnntakData.data
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
          tittel: 'Feil ved anmodning om unntak',
          innhold: httpMessage,
        }];
      }
      return [{
        tittel: 'Teknisk feil',
        innhold: 'Det oppsto en teknisk feil ved anmodning om unntak. Ta kontakt med brukerstøtte dersom problemet oppstår gjentatte ganger.',
      }];
    }
    return [];
  }
);
