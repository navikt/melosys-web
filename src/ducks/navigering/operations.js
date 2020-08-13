import { push } from 'connected-react-router';

import { oppgaverOperations } from '../oppgaver';

export const tilForsiden = () => async dispatch => {
  dispatch(oppgaverOperations.oversikt());
  dispatch(push('/'));
};
