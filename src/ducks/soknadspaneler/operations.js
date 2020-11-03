import * as Actions from './actions';

export const visSoknadspanel = () => async dispatch => (
  dispatch(Actions.oppdaterVisSoknadspanel({ synlig: true }))
);

export const skjulSoknadspanel = () => async dispatch => (
  dispatch(Actions.oppdaterVisSoknadspanel({ synlig: true }))
);
