/**
 * Operations
 * ----------------------------------------------------------------------------------
 * Dette er Thunk-operasjoner som muliggjør asynkrone kall mot Redux
 * ved å returnere en action-generatoren som en egen funksjon. Denne kjøres deretter
 * når det asynkrone kallet, feks fra API'et er ferdigkjørt.
 *
 */

import * as Api from '../../services/api';
import { doThenDispatch } from '../../services/utils';
import { lovvalgsbestemmelser, trygdedekninger, medlemskapstyper, landkoder, INNVILGET, AVSLAATT } from '../../kodeverk/koder';

import * as Types from './types';
import * as Actions from './actions';

import { soknadSelectors } from '../soknad';
import { vilkarSelectors } from '../vilkar';
import { formSelectors } from '../form';

/** Lovvalgsperioder bygges basert på hvilken artikkel (lovvalg) som saksbehandler har valgt.
 * Hvert lovvalg har sin egen funksjon som kjenner til hvordan dette lovvalget skal bygges. Noen
 * søknader vil resultere i flere lovvalg, feks arbeid i flere land. Derfor leveres
 * lovvalgsperioder som en array tilbake til backend, på lik linje som vilkar og avklartefakta.
 *
 * Eksempel på modell for et enkelt lovvalg:
 * {
 *  "fomDato": "2019-01-01",
 *  "tomDato": "2020-01-01",
 *  "lovvalgBestemmelse": "ART12_1",
 *  "unntakFraBestemmelse": "ART12_1",
 *  "innvilgelsesResultat": "INNVILGET",
 *  "lovvalgsland": "NO",
 *  "unntakFraLovvalgsland": "NO",
 *  "trygdeDekning": "FULL",
 *  "medlemskapstype": "PLIKTIG"
 * }
 *
 */

/* Hjelpefunksjoner
 * Disse eksponeres ikke utad, men er kun ment for å bryte opp komplisert logikk og gjøre
 * koden mer lesbar.
 */

const byggLovvalgsPeriodeArtikkel12_1 = getState => {
  const soknadPeriode = soknadSelectors.OppholdUtlandPeriodeSelector(getState());
  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgBestemmelse: lovvalgsbestemmelser.FO_883_2004_ART12_1,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: INNVILGET,
    lovvalgsland: landkoder.NO,
    trygdeDekning: trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel12_2 = getState => {
  const soknadPeriode = soknadSelectors.OppholdUtlandPeriodeSelector(getState());
  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgBestemmelse: lovvalgsbestemmelser.FO_883_2004_ART12_2,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: INNVILGET,
    lovvalgsland: landkoder.NO,
    trygdeDekning: trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel11_3A = getState => {
  const soknadPeriode = soknadSelectors.OppholdUtlandPeriodeSelector(getState());
  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgBestemmelse: lovvalgsbestemmelser.FO_883_2004_ART11_3A,
    tilleggBestemmelse: lovvalgsbestemmelser.FO_883_2004_ART11_4_1,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: INNVILGET,
    lovvalgsland: landkoder.NO,
    trygdeDekning: trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel11_4_2 = getState => {
  const soknadPeriode = soknadSelectors.OppholdUtlandPeriodeSelector(getState());
  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgBestemmelse: lovvalgsbestemmelser.FO_883_2004_ART11_4_2,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: INNVILGET,
    lovvalgsland: landkoder.NO,
    trygdeDekning: trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel16_1 = getState => {
  const soknadPeriode = soknadSelectors.OppholdUtlandPeriodeSelector(getState());
  const soknadOppholdsland = soknadSelectors.OppholdsLandSelector(getState());

  const unntakFraLovvalgsland = soknadOppholdsland.join('');
  const lovvalgsperiode = formSelectors.Lovvalgsperiode(getState());
  const { unntakFraBestemmelse } = lovvalgsperiode;

  if (!unntakFraLovvalgsland || !lovvalgsperiode || !unntakFraBestemmelse) { return false; }

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgBestemmelse: lovvalgsbestemmelser.FO_883_2004_ART16_1,
    tilleggBestemmelse: null,
    unntakFraBestemmelse,
    unntakFraLovvalgsland,
    innvilgelsesResultat: INNVILGET,
    lovvalgsland: landkoder.NO,
    trygdeDekning: trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: medlemskapstyper.PLIKTIG,
  }];
};

const byggAvslaattLovvalg = getState =>  {
  const soknadPeriode = soknadSelectors.OppholdUtlandPeriodeSelector(getState());

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgBestemmelse: null,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: AVSLAATT,
    lovvalgsland: landkoder.NO,
    trygdeDekning: trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPerioder = (valgtLovvalg, getState) => {
  switch (valgtLovvalg) {
    case lovvalgsbestemmelser.FO_883_2004_ART12_1: return byggLovvalgsPeriodeArtikkel12_1(getState);
    case lovvalgsbestemmelser.FO_883_2004_ART12_2: return byggLovvalgsPeriodeArtikkel12_2(getState);
    case lovvalgsbestemmelser.FO_883_2004_ART16_1: return byggLovvalgsPeriodeArtikkel16_1(getState);
    case lovvalgsbestemmelser.FO_883_2004_ART11_3A: return byggLovvalgsPeriodeArtikkel11_3A(getState);
    case lovvalgsbestemmelser.FO_883_2004_ART11_4_2: return byggLovvalgsPeriodeArtikkel11_4_2(getState);
    case false: return byggAvslaattLovvalg(getState);
    default: return [];
  }
};

const finnValgteVilkar = alleLovvalgsVilkar => {
  const vilkarObjekt = alleLovvalgsVilkar.find(enkeltLovvalg => enkeltLovvalg.oppfylt) || {};
  return vilkarObjekt.vilkaar || false;
};

export function hent(behandlingID) {
  return doThenDispatch(() => Api.Lovvalgsperioder.hent(behandlingID), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function send(behandlingID, body) {
  return doThenDispatch(() => Api.Lovvalgsperioder.send(behandlingID, body), {
    OK: Types.OK,
    FEILET: Types.FEILET,
    PENDING: Types.PENDING,
  });
}

export function oppdaterLovvalgsperioderState() {
  return (dispatch, getState) => {
    const valgtLovvalg = finnValgteVilkar(vilkarSelectors.valgteLovvalgsVilkar(getState()));
    const lovvalgsPerioder = byggLovvalgsPerioder(valgtLovvalg, getState);
    (dispatch(Actions.oppdaterLovvalgsperioderState(lovvalgsPerioder)));
  };
}

export function resetLovvalgsperioderState() {
  return Actions.resetLovvalgsperioderState();
}

export function avslaLovvalg() {
  return dispatch => {

  };
}
