import * as Actions from './actions';

export const visHenlegg = () => async dispatch => (
  dispatch(Actions.oppdaterHenlegg({ synlig: true }))
);

export const skjulHenlegg = () => async dispatch => (
  dispatch(Actions.oppdaterHenlegg({ synlig: false }))
);

export const visAvsluttSakSomBortfalt = () => async dispatch => (
  dispatch(Actions.oppdaterAvsluttSakSomBortfalt({ synlig: true }))
);

export const skjulAvsluttSakSomBortfalt = () => async dispatch => (
  dispatch(Actions.oppdaterAvsluttSakSomBortfalt({ synlig: false }))
);

export const visAvslagSoknad = () => async dispatch => (
  dispatch(Actions.oppdaterAvslagSoknad({ synlig: true }))
);

export const skjulAvslagSoknad = () => async dispatch => (
  dispatch(Actions.oppdaterAvslagSoknad({ synlig: false }))
);

export const visOppfrisk = () => async dispatch => (
  dispatch(Actions.oppdaterOppfrisk({ synlig: true }))
);

export const skjulOppfrisk = () => async dispatch => (
  dispatch(Actions.oppdaterOppfrisk({ synlig: false }))
);

export const leggTilBehandlingOppfriskes = behandlingID => async dispatch => (
  dispatch(Actions.oppdaterOppfrisk({ behandlingUnderOppfriskning: behandlingID }))
);

export const fjernBehandlingOppfriskes = () => async dispatch => (
  dispatch(Actions.oppdaterOppfrisk({ behandlingUnderOppfriskning: null }))
);

export const visValidering = () => async dispatch => (
  dispatch(Actions.oppdaterValidering({ synlig: true }))
);

export const skjulValidering = () => async dispatch => (
  dispatch(Actions.oppdaterValidering({ synlig: false }))
);

export const visRevurderFagsak = () => async dispatch => (
  dispatch(Actions.oppdaterRevurderFagsak({ synlig: true }))
);

export const skjulRevurderFagsak = () => async dispatch => (
  dispatch(Actions.oppdaterRevurderFagsak({ synlig: false }))
);
