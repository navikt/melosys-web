import * as Actions from "./actions";

export const visHenlegg = () => (dispatch) => dispatch(Actions.oppdaterHenlegg({ synlig: true }));
export const skjulHenlegg = () => (dispatch) => dispatch(Actions.oppdaterHenlegg({ synlig: false }));

export const visBekreftValg = (type) => (dispatch) => dispatch(Actions.oppdaterBekreftValg({ synlig: true, type }));
export const skjulBekreftValg = () => (dispatch) => dispatch(Actions.oppdaterBekreftValg({ synlig: false, type: "" }));

export const visAvslagSoknad = () => (dispatch) => dispatch(Actions.oppdaterAvslagSoknad({ synlig: true }));
export const skjulAvslagSoknad = () => (dispatch) => dispatch(Actions.oppdaterAvslagSoknad({ synlig: false }));

export const visOppfrisk = (inkluderSiste5aar) => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ synlig: true, inkluderSiste5aar }));
export const leggTilInkluderSiste5Aar = (inkluderSiste5aar) => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ inkluderSiste5aar }));
export const resetInkluderSiste5Aar = () => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ inkluderSiste5aar: false }));
export const skjulOppfrisk = () => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ synlig: false, inkluderSiste5Aar: undefined }));

export const leggTilBehandlingOppfriskes = (behandlingID) => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ behandlingUnderOppfriskning: behandlingID }));

export const fjernBehandlingOppfriskes = () => (dispatch) =>
  dispatch(Actions.oppdaterOppfrisk({ behandlingUnderOppfriskning: null }));
