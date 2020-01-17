import MKV from '../../melosyskodeverk';

import * as Api from '../../services/api';
import { doThenDispatch } from '../../services/utils';
import * as Types from './types';
import * as Actions from './actions';
import * as Selectors from './selectors';

import { avklartefaktaSelectors } from '../avklartefakta';
import { soknadSelectors } from '../soknad';
import { behandlingerSelectors } from '../behandlinger';

export function hent(behandlingID) {
  return doThenDispatch(() => Api.Utpekningsperioder.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function send(behandlingID, utpekningsperioder) {
  return doThenDispatch(() => Api.Utpekningsperioder.send(behandlingID, utpekningsperioder), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagre() {
  return (dispatch, getState) => {
    const utpekningsperioder = Selectors.UtpekningsperioderSelector(getState());
    const bid = behandlingerSelectors.BehandlingIDSelector(getState());

    return dispatch(send(bid, { utpekningsperioder }));
  };
}

const byggUtpekningsperiode = (stegState, reduxState) => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(reduxState);
  const lovvalgsland = avklartefaktaSelectors.OmfattesILandSelector(reduxState);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: stegState.lovvalgsbestemmelse,
    tilleggBestemmelse: stegState.tilleggbestemmelse,
    lovvalgsland,
  }];
};

const byggUtpekningsperioder = (stegState, reduxState) => {
  const omfattesIAnnetLand = avklartefaktaSelectors.OmfattesIAnnetLandSelector(reduxState);
  if (!omfattesIAnnetLand) return [];

  switch (stegState.lovvalgsbestemmelse) {
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B2:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B3:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B4:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11:
      return byggUtpekningsperiode(stegState, reduxState);
    default: {
      return [];
    }
  }
};

export function oppdaterUtpekningsperioderState(stegState) {
  return (dispatch, getState) => {
    if (stegState.lovvalgsbestemmelse || stegState.tilleggbestemmelse) {
      const utpekningsperioder = byggUtpekningsperioder(stegState, getState());
      dispatch(Actions.oppdaterUtpekningsperioder(utpekningsperioder));
    } else {
      dispatch(Actions.resetUtpekningsperioderState());
    }
  };
}

export function resetUtpekningsperioderState() {
  return dispatch => dispatch(Actions.resetUtpekningsperioderState());
}
