import MKV from '../../melosyskodeverk';

import * as Api from '../../services/api';
import { doThenDispatch } from '../../services/utils';
import * as Types from './types';
import * as Actions from './actions';
import * as Selectors from './selectors';

import { avklartefaktaSelectors } from '../avklartefakta';
import { behandlingsgrunnlagSelectors } from '../behandlingsgrunnlag';
import { behandlingerSelectors } from '../behandlinger';
import { flytSelectors } from '../flyt';

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
  const periode = behandlingsgrunnlagSelectors.PeriodeSelector(reduxState);
  const lovvalgsland = stegState.lovvalgsland || avklartefaktaSelectors.OmfattesILandSelector(reduxState);

  return [{
    fomDato: periode.fom,
    tomDato: periode.tom,
    lovvalgsbestemmelse: stegState.lovvalgsbestemmelse,
    tilleggsbestemmelse: stegState.tilleggbestemmelse,
    lovvalgsland,
  }];
};

const byggUtpekingsperioder = (stegState, reduxState) => {
  const omfattesIAnnetLand = avklartefaktaSelectors.OmfattesIAnnetLandSelector(reduxState);
  const offentligTjenesteUtland = flytSelectors.HarOffentligTjenesteAnnetLandSelector(reduxState);
  if (!omfattesIAnnetLand && !offentligTjenesteUtland) return [];

  switch (stegState.lovvalgsbestemmelse) {
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B2:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B3:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B4:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4:
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
