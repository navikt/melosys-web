/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import MKV from '../../melosyskodeverk';

import * as Api from '../../services/api';
import { doThenDispatch } from '../../services/utils';
import * as Types from './types';
import * as Actions from './actions';
import * as Selectors from './selectors';

import { soknadSelectors } from '../soknad';
import { lovvalgsperioderSelectors } from '../lovvalgsperioder';
import { anmodningsperioderSelectors } from '../anmodningsperioder';
import { behandlingerSelectors } from '../behandlinger';

export function hent(behandlingID) {
  return doThenDispatch(() => Api.Anmodningsperioder.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function send(behandlingID, anmodningsperioder) {
  return doThenDispatch(() => Api.Anmodningsperioder.send(behandlingID, anmodningsperioder), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function lagre() {
  return (dispatch, getState) => {
    const anmodningsperioder = Selectors.AnmodningsperioderSelector(getState());
    const bid = behandlingerSelectors.BehandlingIDSelector(getState());
    const anmodningsperioderErSendtUtlandet = anmodningsperioderSelectors.AnmodningsperioderErSendtUtlandetSelector(getState());

    if (anmodningsperioderErSendtUtlandet) return null;

    /* eslint-disable-next-line no-unused-vars */
    return dispatch(send(bid, { anmodningsperioder: anmodningsperioder.map(({ sendtUtland, ...beholdProperties }) => beholdProperties) }));
  };
}

const byggAnmodningsperiodeArtikkel16 = (stegState, reduxState) => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(reduxState);
  const soknadsland = soknadSelectors.SoknadslandSelector(reduxState);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);

  const unntakFraLovvalgsland = soknadsland.join('');
  const unntakFraBestemmelse = stegState.unntakfrabestemmelse;

  return [{
    id: null,
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgBestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1,
    tilleggBestemmelse: stegState.tilleggbestemmelse,
    lovvalgsland: MKV.Koder.landkoder.NO,
    unntakFraBestemmelse: unntakFraBestemmelse || null,
    unntakFraLovvalgsland,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
  }];
};

const byggAnmodningsperioder = (stegState, reduxState) => {
  switch (stegState.lovvalgsbestemmelse) {
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1:
      return byggAnmodningsperiodeArtikkel16(stegState, reduxState);
    default: {
      return [];
    }
  }
};

export function oppdaterAnmodningsperioderState(stegState) {
  return (dispatch, getState) => {
    const anmodningsperioderErSendtUtland = anmodningsperioderSelectors.AnmodningsperioderErSendtUtlandetSelector(getState());
    if (anmodningsperioderErSendtUtland) return;

    if (stegState.lovvalgsbestemmelse || stegState.tilleggbestemmelse || stegState.unntakfrabestemmelse) {
      const anmodningsperioder = byggAnmodningsperioder(stegState, getState());
      dispatch(Actions.oppdaterAnmodningsperioder(anmodningsperioder));
    } else {
      dispatch(Actions.resetAnmodningsperioderState());
    }
  };
}

export function resetAnmodningsperioderState() {
  return dispatch => dispatch(Actions.resetAnmodningsperioderState());
}
