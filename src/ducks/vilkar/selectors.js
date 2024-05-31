/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from "reselect";

import MKV from "../../melosyskodeverk";
import { avklartefaktaSelectors } from "../avklartefakta";
import * as KV from "../../kodeverk";

const finnVilkår = (alleVilkår, vilkårKode) => alleVilkår?.find((enkelt) => enkelt.vilkaar === vilkårKode) ?? {};

const finnVilkårEllerNull = (alleVilkår, vilkårKode) =>
  alleVilkår?.find((enkelt) => enkelt.vilkaar === vilkårKode) ?? null;

// selector(s)
export const VilkarSelector = createSelector(
  (state) => (state.vilkar.data ? state.vilkar.data : []),
  (vurdering) => vurdering
);

export const vesentligVirksomhetSelector = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.ART12_1_VESENTLIG_VIRKSOMHET)
);

export const normaltDriverVirksomhetSelector = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.ART12_2_NORMALT_DRIVER_VIRKSOMHET)
);

export const forutgaendeMedlemskap = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.ART12_1_FORUTGAAENDE_MEDLEMSKAP)
);

export const art11_3A = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) =>
    finnVilkår(alleVilkar, MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A)
);

export const art11_4_1 = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) =>
    finnVilkår(alleVilkar, MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1)
);

export const art11_4_2 = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) =>
    finnVilkår(alleVilkar, MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2)
);

export const nis = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.FTRL_2_12_UNNTAK_TURISTSKIP)
);

export const UtsendingsvilkårArbeidstakerSelector = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art12_1 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART12_1);
    const art14_1 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART14_1);
    const art16_1 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART16_1);

    return art12_1 ?? art14_1 ?? art16_1 ?? {};
  }
);

export const UtsendingsvilkårNæringsdrivendeSelector = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art12_2 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART12_2);
    const art14_2 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART14_2);
    const art16_3 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART16_3);

    return art12_2 ?? art14_2 ?? art16_3 ?? {};
  }
);

export const UtsendingsvilkårSelector = createSelector(
  (state) => UtsendingsvilkårArbeidstakerSelector(state),
  (state) => UtsendingsvilkårNæringsdrivendeSelector(state),
  (state) => avklartefaktaSelectors.YrkesaktivitetSelector(state),
  (utsendingsvilkårforArbeidstaker, utsendingsvilkårForNæringsdrivende, yrkesaktivitet) => {
    if (yrkesaktivitet === KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER) {
      return utsendingsvilkårforArbeidstaker;
    }
    if (yrkesaktivitet === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE) {
      return utsendingsvilkårForNæringsdrivende;
    }
    return {};
  }
);

export const UnntaksvilkårSelector = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art16_1 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART16_1);
    const art18_1 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART18_1);

    return art16_1 ?? art18_1 ?? {};
  }
);

export const Artikkel11_3AEller13_3ASelector = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art11_3A_eøs = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART11_3A);
    const art13_3A_gb = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART13_3A);
    return art11_3A_eøs ?? art13_3A_gb ?? {};
  }
);

export const Artikkel11_4_1Eller13_4_1Selector = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art11_4_1_eøs = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART11_4_1);
    const art13_4_1_gb = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART13_4_1);
    return art11_4_1_eøs ?? art13_4_1_gb ?? {};
  }
);

export const Artikkel11_4_2Eller13_4_2Selector = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art11_4_2_eøs = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART11_4_2);
    const art13_4_2_gb = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART13_4_2);
    return art11_4_2_eøs ?? art13_4_2_gb ?? {};
  }
);

export const art12_1 = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART12_1)
);

export const art12_1_begrunnelserSelector = createSelector(
  (state) => art12_1(state),
  (art12_1_vilkar) => art12_1_vilkar.begrunnelseKoder || []
);

export const art12_2 = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART12_2)
);

export const art12_2_begrunnelserSelector = createSelector(
  (state) => art12_2(state),
  (art12_2_vilkar) => art12_2_vilkar.begrunnelseKoder || []
);

export const art16_1 = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART16_1)
);

export const art16_1_begrunnelserSelector = createSelector(
  (state) => art16_1(state),
  (art16_1_vilkar) => art16_1_vilkar.begrunnelseKoder || []
);

export const art16_1_fritekstSelector = createSelector(
  (state) => art16_1(state),
  (art16_1_vilkar) => art16_1_vilkar.begrunnelseFritekst
);

export const valgteLovvalgsVilkar = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const alleLovvalg = [
      ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004,
      ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009,
      ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia,
    ];
    return alleVilkar.filter((enkeltVilkar) =>
      alleLovvalg.find((enkeltLovvalg) => enkeltLovvalg.kode === enkeltVilkar.vilkaar)
    );
  }
);

export const valgteTilleggsVilkar = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const alleTilleggsbestemmelser = [
      ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004,
      ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_konv_efta_storbritannia,
    ];
    return alleVilkar.filter((enkeltVilkar) =>
      alleTilleggsbestemmelser.find((enkeltTilleggslovvalg) => enkeltTilleggslovvalg.kode === enkeltVilkar.vilkaar)
    );
  }
);

export const vilkarBegrunnelserSelector = createSelector(
  (state) => vesentligVirksomhetSelector(state),
  (state) => normaltDriverVirksomhetSelector(state),
  (state) => forutgaendeMedlemskap(state),
  (vesentligvirksomhet, normaltDrivervirksomhet, forutgaendemedlemskap) =>
    [
      ...(vesentligvirksomhet.begrunnelseKoder || []),
      ...(normaltDrivervirksomhet.begrunnelseKoder || []),
      ...(forutgaendemedlemskap.begrunnelseKoder || []),
    ] || []
);
