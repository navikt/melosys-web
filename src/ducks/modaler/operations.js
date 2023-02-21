import * as Actions from "./actions";

export const visHenlegg = () => (dispatch) => dispatch(Actions.oppdaterHenlegg({ synlig: true }));
export const skjulHenlegg = () => (dispatch) => dispatch(Actions.oppdaterHenlegg({ synlig: false }));

export const visBekreftValgDialog = (bekreftValgType) => (dispatch) =>
  dispatch(Actions.oppdaterBekreftValg({ synlig: true, type: bekreftValgType }));
export const skjulBekreftValg = () => (dispatch) => dispatch(Actions.oppdaterBekreftValg({ synlig: false, type: "" }));

export const visAvslagSoknad = () => (dispatch) => dispatch(Actions.oppdaterAvslagSoknad({ synlig: true }));
export const skjulAvslagSoknad = () => (dispatch) => dispatch(Actions.oppdaterAvslagSoknad({ synlig: false }));

export const visOppfrisk = () => (dispatch) => dispatch(Actions.oppdaterOppfrisk({ synlig: true }));
export const skjulOppfrisk = () => (dispatch) => dispatch(Actions.oppdaterOppfrisk({ synlig: false }));

export const leggTilBehandlingOppfriskes = (behandlingID) => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ behandlingUnderOppfriskning: behandlingID }));

export const fjernBehandlingOppfriskes = () => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ behandlingUnderOppfriskning: null }));
