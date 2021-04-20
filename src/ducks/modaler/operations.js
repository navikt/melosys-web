import * as Actions from "./actions";

export const visHenlegg = () => (dispatch) => dispatch(Actions.oppdaterHenlegg({ synlig: true }));
export const skjulHenlegg = () => (dispatch) => dispatch(Actions.oppdaterHenlegg({ synlig: false }));

export const visAvsluttSakSomBortfalt = () => (dispatch) =>
  dispatch(Actions.oppdaterAvsluttSakSomBortfalt({ synlig: true }));
export const skjulAvsluttSakSomBortfalt = () => (dispatch) =>
  dispatch(Actions.oppdaterAvsluttSakSomBortfalt({ synlig: false }));

export const visAvslagSoknad = () => (dispatch) => dispatch(Actions.oppdaterAvslagSoknad({ synlig: true }));
export const skjulAvslagSoknad = () => (dispatch) => dispatch(Actions.oppdaterAvslagSoknad({ synlig: false }));

export const visOppfrisk = () => (dispatch) => dispatch(Actions.oppdaterOppfrisk({ synlig: true }));
export const skjulOppfrisk = () => (dispatch) => dispatch(Actions.oppdaterOppfrisk({ synlig: false }));

export const leggTilBehandlingOppfriskes = (behandlingID) => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ behandlingUnderOppfriskning: behandlingID }));

export const fjernBehandlingOppfriskes = () => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ behandlingUnderOppfriskning: null }));

export const visValidering = () => (dispatch) => dispatch(Actions.oppdaterValidering({ synlig: true }));
export const skjulValidering = () => (dispatch) => dispatch(Actions.oppdaterValidering({ synlig: false }));

export const visRevurderFagsak = () => (dispatch) => dispatch(Actions.oppdaterRevurderFagsak({ synlig: true }));
export const skjulRevurderFagsak = () => (dispatch) => dispatch(Actions.oppdaterRevurderFagsak({ synlig: false }));

export const visEndreBehandlingstema = () => (dispatch) =>
  dispatch(Actions.oppdaterEndreBehandlingstema({ synlig: true }));
export const skjulEndreBehandlingstema = () => (dispatch) =>
  dispatch(Actions.oppdaterEndreBehandlingstema({ synlig: false }));

export const visEndreBehandlingsstatus = () => (dispatch) =>
  dispatch(Actions.oppdaterEndreBehandlingsstatus({ synlig: true }));
export const skjulEndreBehandlingsstatus = () => (dispatch) =>
  dispatch(Actions.oppdaterEndreBehandlingsstatus({ synlig: false }));

export const visEndreBehandlingsfrist = () => (dispatch) =>
  dispatch(Actions.oppdaterEndreBehandlingsfrist({ synlig: true }));
export const skjulEndreBehandlingsfrist = () => (dispatch) =>
  dispatch(Actions.oppdaterEndreBehandlingsfrist({ synlig: false }));
