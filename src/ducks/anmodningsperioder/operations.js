/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */
import * as MKV from 'melosys-kodeverk';

import * as Api from '../../services/api';
import { doThenDispatch } from '../../services/utils';
import * as Types from './types';
import * as Actions from './actions';

import { soknadSelectors } from '../soknad';
import { lovvalgsperioderSelectors } from '../lovvalgsperioder';
import { formSelectors } from '../form';
import { anmodningsperioderSelectors } from '../anmodningsperioder';

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

const byggAnmodningsperiodeArtikkel16 = state => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(state);
  const soknadsland = soknadSelectors.SoknadslandSelector(state);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(state);

  const unntakFraLovvalgsland = soknadsland.join('');
  const unntakFraBestemmelse = formSelectors.UnntakFraBestemmelseSelector(state);

  return [{
    id: null,
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgBestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1,
    tilleggBestemmelse: null,
    lovvalgsland: MKV.Koder.landkoder.NO,
    unntakFraBestemmelse: unntakFraBestemmelse || null,
    unntakFraLovvalgsland,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
  }];
};

const byggAnmodningsperioder = (lovvalgsbestemmelse, state) => {
  switch (lovvalgsbestemmelse) {
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1:
      return byggAnmodningsperiodeArtikkel16(state);
    default: {
      return [];
    }
  }
};

export function oppdaterAnmodningsperioderState(lovvalgsbestemmelse) {
  return (dispatch, getState) => {
    const anmodningsperioderErSendtUtland = anmodningsperioderSelectors.AnmodningsperioderErSendtUtlandetSelector(getState());
    if (anmodningsperioderErSendtUtland) return;

    if (lovvalgsbestemmelse) {
      const anmodningsperioder = byggAnmodningsperioder(lovvalgsbestemmelse, getState());
      dispatch(Actions.oppdaterAnmodningsperioder(anmodningsperioder));
    } else {
      dispatch(Actions.resetAnmodningsperioderState());
    }
  };
}

export function resetAnmodningsperioderState() {
  return dispatch => dispatch(Actions.resetAnmodningsperioderState());
}
