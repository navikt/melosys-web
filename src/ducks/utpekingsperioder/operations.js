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
  return doThenDispatch(() => Api.Utpekingsperioder.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function send(behandlingID, utpekingsperioder) {
  return doThenDispatch(() => Api.Utpekingsperioder.send(behandlingID, utpekingsperioder), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagre() {
  return (dispatch, getState) => {
    const utpekingsperioder = Selectors.UtpekingsperioderSelector(getState());
    const bid = behandlingerSelectors.BehandlingIDSelector(getState());

    return dispatch(send(bid, { utpekingsperioder }));
  };
}

const byggUtpekingsperiode = (stegState, reduxState) => {
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

const byggUtpekingsperioder = (stegState, reduxState) => {
  const omfattesIAnnetLand = avklartefaktaSelectors.OmfattesIAnnetLandSelector(reduxState);
  if (!omfattesIAnnetLand) return [];

  switch (stegState.lovvalgsbestemmelse) {
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B2:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B3:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B4:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11:
      return byggUtpekingsperiode(stegState, reduxState);
    default: {
      return [];
    }
  }
};

export function oppdaterUtpekingsperioderState(stegState) {
  return (dispatch, getState) => {
    if (stegState.lovvalgsbestemmelse || stegState.tilleggbestemmelse) {
      const utpekingsperioder = byggUtpekingsperioder(stegState, getState());
      dispatch(Actions.oppdaterUtpekingsperioder(utpekingsperioder));
    } else {
      dispatch(Actions.resetUtpekingsperioderState());
    }
  };
}

export function resetUtpekingsperioderState() {
  return dispatch => dispatch(Actions.resetUtpekingsperioderState());
}
