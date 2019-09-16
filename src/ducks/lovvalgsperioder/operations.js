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
import * as KV from '../../kodeverk';

import * as Types from './types';
import * as Actions from './actions';

import { soknadSelectors } from '../soknad';
import { vilkarSelectors } from '../vilkar';
import { formSelectors } from '../form';
import { avklartefaktaSelectors } from '../avklartefakta';
import { lovvalgsperioderSelectors } from './index';

/** Lovvalgsperioder bygges basert på hvilken artikkel (lovvalg) som saksbehandler har valgt.
 * Hvert lovvalg har sin egen funksjon som kjenner til hvordan dette lovvalget skal bygges. Noen
 * søknader vil resultere i flere lovvalg, feks arbeid i flere land. Derfor leveres
 * lovvalgsperioder som en array tilbake til backend, på lik linje som vilkar og avklartefakta.
 *
 * Eksempel på modell for et enkelt lovvalg:
 * {
 *  "fomDato": "2019-01-01",
 *  "tomDato": "2020-01-01",
 *  "lovvalgsbestemmelse": "ART12_1",
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

const finnValgteVilkar = alleLovvalgsVilkar => {
  const vilkarObjekt = alleLovvalgsVilkar.find(enkeltLovvalg => enkeltLovvalg.oppfylt) || {};
  return vilkarObjekt.vilkaar || false;
};

const byggLovvalgsPeriodeArtikkel12_1 = state => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(state);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(state);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: MKV.Koder.landkoder.NO,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel12_2 = state => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(state);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(state);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_2,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: MKV.Koder.landkoder.NO,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel11_3A = state => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(state);
  const tilleggsbestemmelse = finnValgteVilkar(vilkarSelectors.valgteTilleggsVilkar(state));
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(state);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: tilleggsbestemmelse || null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: MKV.Koder.landkoder.NO,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel11_4_2 = state => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(state);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(state);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: MKV.Koder.landkoder.NO,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel16_1 = state => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(state);
  const soknadsland = soknadSelectors.SoknadslandSelector(state);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(state);

  const unntakFraLovvalgsland = soknadsland.join('');
  const unntakFraBestemmelse = formSelectors.UnntakFraBestemmelseSelector(state);

  // Det er ikke et gyldig art16-lovvalg før unntakene er oppgitt
  if (!unntakFraBestemmelse || !unntakFraLovvalgsland) {
    return [];
  }

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: null,
    unntakFraBestemmelse,
    unntakFraLovvalgsland,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: MKV.Koder.landkoder.NO,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  }];
};

const byggAvslaattLovvalg = (state, lovvalgsbestemmelse) => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(state);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(state);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: KV.Koder.AVSLAATT,
    lovvalgsland: null,
    trygdeDekning: MKV.Koder.trygdedekninger.UTEN_DEKNING,
    medlemskapstype: null,
  }];
};

const hentLovvalgsBestemmelseForAvslag = state => {
  if (avklartefaktaSelectors.Yrkesaktivitet(state) === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE) {
    return MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_2;
  }
  return MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1;
};

const byggLovvalgsPerioderFraVilkaar = (valgtLovvalg, state) => {
  if (!valgtLovvalg) {
    return byggAvslaattLovvalg(state, hentLovvalgsBestemmelseForAvslag(state));
  }

  switch (valgtLovvalg) {
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1: return byggLovvalgsPeriodeArtikkel12_1(state);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_2: return byggLovvalgsPeriodeArtikkel12_2(state);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1: return byggLovvalgsPeriodeArtikkel16_1(state);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A: return byggLovvalgsPeriodeArtikkel11_3A(state);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2: return byggLovvalgsPeriodeArtikkel11_4_2(state);
    default: {
      return [];
    }
  }
};

const bestemLovvalgsland = lovvalgsbestemmelse => {
  switch (lovvalgsbestemmelse) {
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A:
      return MKV.Koder.landkoder.NO;
    default:
      return null;
  }
};

const byggLovvalgsPerioder = (lovvalgsbestemmelse, state) => {
  if (lovvalgsbestemmelse === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1) return [];

  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(state);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(state);
  const lovvalgsland = bestemLovvalgsland(lovvalgsbestemmelse);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  }];
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

export function oppdaterLovvalgsperioderState(lovvalgsbestemmelse) {
  return (dispatch, getState) => {
    const alleLovvalgsvilkar = vilkarSelectors.valgteLovvalgsVilkar(getState());
    if (lovvalgsbestemmelse) {
      const lovvalgsPerioder = byggLovvalgsPerioder(lovvalgsbestemmelse, getState());
      dispatch(Actions.oppdaterLovvalgsperioderState(lovvalgsPerioder));
    } else if (alleLovvalgsvilkar.length > 0) {
      const valgtLovvalg = finnValgteVilkar(alleLovvalgsvilkar);
      const lovvalgsPerioder = byggLovvalgsPerioderFraVilkaar(valgtLovvalg, getState());
      dispatch(Actions.oppdaterLovvalgsperioderState(lovvalgsPerioder));
    } else {
      dispatch(Actions.resetLovvalgsperioderState());
    }
  };
}

export function resetLovvalgsperioderState() {
  return Actions.resetLovvalgsperioderState();
}

export function endreLovvalgsPeriode(fomdato, tomdato) {
  return Actions.endrePeriode(fomdato, tomdato);
}
