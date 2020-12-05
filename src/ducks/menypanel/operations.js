import * as Actions from './actions';

export const visMenypanel = () => async dispatch => (
  dispatch(Actions.oppdaterVisMenypanel({ synlig: true }))
);

export const skjulMenypanel = () => async dispatch => (
  dispatch(Actions.oppdaterVisMenypanel({ synlig: false }))
);
