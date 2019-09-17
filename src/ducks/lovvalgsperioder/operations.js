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

const byggLovvalgsPeriodeArtikkel12_1 = (stegState, reduxState) => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(reduxState);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: stegState.tilleggbestemmelse || null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: MKV.Koder.landkoder.NO,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel12_2 = (stegState, reduState) => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(reduState);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduState);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_2,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: stegState.tilleggbestemmelse || null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: MKV.Koder.landkoder.NO,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel11_3A = (stegState, reduxState) => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(reduxState);
  const tilleggsbestemmelseFraVilkar = finnValgteVilkar(vilkarSelectors.valgteTilleggsVilkar(reduxState));
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: stegState.tilleggbestemmelse || tilleggsbestemmelseFraVilkar || null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: MKV.Koder.landkoder.NO,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel11_4_2 = (stegState, reduxState) => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(reduxState);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: stegState.tilleggbestemmelse || null,
    unntakFraBestemmelse: null,
    unntakFraLovvalgsland: null,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: MKV.Koder.landkoder.NO,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  }];
};

const byggLovvalgsPeriodeArtikkel16_1 = (stegState, reduxState) => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(reduxState);
  const soknadsland = soknadSelectors.SoknadslandSelector(reduxState);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);

  const unntakFraLovvalgsland = soknadsland.join('');
  const unntakFraBestemmelse = formSelectors.UnntakFraBestemmelseSelector(reduxState);

  // Det er ikke et gyldig art16-lovvalg før unntakene er oppgitt
  if (!unntakFraBestemmelse || !unntakFraLovvalgsland) {
    return [];
  }

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: stegState.tilleggbestemmelse || null,
    unntakFraBestemmelse,
    unntakFraLovvalgsland,
    innvilgelsesResultat: KV.Koder.INNVILGET,
    lovvalgsland: MKV.Koder.landkoder.NO,
    trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
    medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  }];
};

const byggAvslaattLovvalg = (reduxState, lovvalgsbestemmelse) => {
  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(reduxState);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);

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

const byggLovvalgsPerioderFraVilkaar = (valgtLovvalg, stegState, reduxState) => {
  if (!valgtLovvalg) {
    return byggAvslaattLovvalg(reduxState, hentLovvalgsBestemmelseForAvslag(reduxState));
  }

  switch (valgtLovvalg) {
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1: return byggLovvalgsPeriodeArtikkel12_1(stegState, reduxState);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_2: return byggLovvalgsPeriodeArtikkel12_2(stegState, reduxState);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1: return byggLovvalgsPeriodeArtikkel16_1(stegState, reduxState);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A: return byggLovvalgsPeriodeArtikkel11_3A(stegState, reduxState);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2: return byggLovvalgsPeriodeArtikkel11_4_2(stegState, reduxState);
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

const byggLovvalgsPerioder = (stegState, reduxState) => {
  if (stegState.lovvalgsbestemmelse === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1) return [];

  const soknadPeriode = soknadSelectors.SoknadsperiodeSelector(reduxState);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);
  const lovvalgsland = bestemLovvalgsland(stegState.lovvalgsbestemmelse);

  return [{
    fomDato: soknadPeriode.fom,
    tomDato: soknadPeriode.tom,
    lovvalgsbestemmelse: stegState.lovvalgsbestemmelse || null,
    medlemskapsperiodeID: medlemskapsperiodeID || null,
    tilleggBestemmelse: stegState.tilleggbestemmelse || null,
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

export function oppdaterLovvalgsperioderState(stegState) {
  return (dispatch, getState) => {
    const reduxState = getState();
    const alleLovvalgsvilkar = vilkarSelectors.valgteLovvalgsVilkar(reduxState);

    if (alleLovvalgsvilkar.length > 0) {
      const valgtLovvalg = finnValgteVilkar(alleLovvalgsvilkar);
      const lovvalgsPerioder = byggLovvalgsPerioderFraVilkaar(valgtLovvalg, stegState, reduxState);
      dispatch(Actions.oppdaterLovvalgsperioderState(lovvalgsPerioder));
    } else if (stegState.lovvalgsbestemmelse || stegState.tilleggbestemmelse) {
      const lovvalgsPerioder = byggLovvalgsPerioder(stegState, reduxState);
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
