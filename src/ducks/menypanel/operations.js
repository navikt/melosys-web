import * as Actions from "./actions";

export const visMenypanel = () => async (dispatch) => dispatch(Actions.oppdaterVisMenypanel({ synlig: true }));

export const skjulMenypanel = () => async (dispatch) => dispatch(Actions.oppdaterVisMenypanel({ synlig: false }));

export const fullmektigEndretTrue = () => async (dispatch) =>
  dispatch(Actions.toggleFullmektigEndret({ fullmektig: { fullmektigEndret: true } }));

export const fullmektigEndretFalse = () => async (dispatch) =>
  dispatch(Actions.toggleFullmektigEndret({ fullmektig: { fullmektigEndret: false } }));
