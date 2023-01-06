import * as Actions from "./actions";

export const visHenlegg = () => (dispatch) => dispatch(Actions.oppdaterHenlegg({ synlig: true }));
export const skjulHenlegg = () => (dispatch) => dispatch(Actions.oppdaterHenlegg({ synlig: false }));

export const visAvsluttSakSomBortfalt = () => (dispatch) =>
  dispatch(Actions.oppdaterAvsluttSakSomBortfalt({ synlig: true }));
export const skjulAvsluttSakSomBortfalt = () => (dispatch) =>
  dispatch(Actions.oppdaterAvsluttSakSomBortfalt({ synlig: false }));

export const visFerdigbehandleSak = () => (dispatch) => dispatch(Actions.oppdaterFerdigbehandleSak({ synlig: true }));
export const skjulFerdigbehandleSak = () => (dispatch) =>
  dispatch(Actions.oppdaterFerdigbehandleSak({ synlig: false }));

export const visAvslagSoknad = () => (dispatch) => dispatch(Actions.oppdaterAvslagSoknad({ synlig: true }));
export const skjulAvslagSoknad = () => (dispatch) => dispatch(Actions.oppdaterAvslagSoknad({ synlig: false }));

export const visOppfrisk = () => (dispatch) => dispatch(Actions.oppdaterOppfrisk({ synlig: true }));
export const skjulOppfrisk = () => (dispatch) => dispatch(Actions.oppdaterOppfrisk({ synlig: false }));

export const leggTilBehandlingOppfriskes = (behandlingID) => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ behandlingUnderOppfriskning: behandlingID }));

export const fjernBehandlingOppfriskes = () => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ behandlingUnderOppfriskning: null }));
