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
/** @type {import('reselect').Selector<import('../../AppTypes').RootState, import('../../services/api').Vilkaar[]>} */
export const VilkarSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => (state.vilkar.data ? state.vilkar.data : []),
  (vurdering) => vurdering,
);

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, Partial<import('../../services/api').Vilkaar>>} */
export const VesentligVirksomhetSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.VESENTLIG_VIRKSOMHET),
);

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, Partial<import('../../services/api').Vilkaar>>} */
export const NormaltDriverVirksomhetSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.NORMALT_DRIVER_VIRKSOMHET),
);

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, Partial<import('../../services/api').Vilkaar>>} */
export const ForutgaendeMedlemskapSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.FORUTGAAENDE_MEDLEMSKAP),
);

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, Partial<import('../../services/api').Vilkaar> | null>} */
export const UtsendingsvilkårArbeidstakerSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art12_1 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART12_1);
    const art14_1 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART14_1);
    const art16_1 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART16_1);

    return art12_1 ?? art14_1 ?? art16_1 ?? {};
  },
);

export const UtsendingsvilkårArbeidstakerBegrunnelserSelector = createSelector(
  (state) => UtsendingsvilkårArbeidstakerSelector(state),
  (vilkar) => vilkar.begrunnelseKoder || [],
);

export const UtsendingsvilkårNæringsdrivendeSelector = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art12_2 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART12_2);
    const art14_2 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART14_2);
    const art16_3 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART16_3);

    return art12_2 ?? art14_2 ?? art16_3 ?? {};
  },
);

export const UtsendingsvilkårNæringsdrivendeBegrunnelserSelector = createSelector(
  (state) => UtsendingsvilkårNæringsdrivendeSelector(state),
  (vilkar) => vilkar.begrunnelseKoder || [],
);

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, Partial<import('../../services/api').Vilkaar> | {}>} */
export const UtsendingsvilkårSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => UtsendingsvilkårArbeidstakerSelector(state),
  /** @param {import('../../AppTypes').RootState} state */
  (state) => UtsendingsvilkårNæringsdrivendeSelector(state),
  /** @param {import('../../AppTypes').RootState} state */
  (state) => avklartefaktaSelectors.YrkesaktivitetSelector(state),
  (utsendingsvilkårforArbeidstaker, utsendingsvilkårForNæringsdrivende, yrkesaktivitet) => {
    if (yrkesaktivitet === KV.Koder.VurderingYrkesaktivitetTyper.ORDINAER_ARBEIDSTAKER) {
      return utsendingsvilkårforArbeidstaker;
    }
    if (yrkesaktivitet === KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE) {
      return utsendingsvilkårForNæringsdrivende;
    }
    return {};
  },
);

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, Partial<import('../../services/api').Vilkaar> | null>} */
export const UnntaksvilkårSelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art16_1 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART16_1);
    const art18_1 = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART18_1);

    return art16_1 ?? art18_1 ?? {};
  },
);

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, Partial<import('../../services/api').Vilkaar> | null>} */
export const Artikkel11_3AEller13_3ASelector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art11_3A_eøs = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART11_3A);
    const art13_3A_gb = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART13_3A);
    return art11_3A_eøs ?? art13_3A_gb ?? {};
  },
);

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, Partial<import('../../services/api').Vilkaar> | null>} */
export const Artikkel11_4_1Eller13_4_1Selector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art11_4_1_eøs = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART11_4_1);
    const art13_4_1_gb = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART13_4_1);
    return art11_4_1_eøs ?? art13_4_1_gb ?? {};
  },
);

/** @type {import('reselect').Selector<import('../../AppTypes').RootState, Partial<import('../../services/api').Vilkaar> | null>} */
export const Artikkel11_4_2Eller13_4_2Selector = createSelector(
  /** @param {import('../../AppTypes').RootState} state */
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const art11_4_2_eøs = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART11_4_2);
    const art13_4_2_gb = finnVilkårEllerNull(alleVilkar, MKV.Koder.vilkaar.KONV_EFTA_STORBRITANNIA_ART13_4_2);
    return art11_4_2_eøs ?? art13_4_2_gb ?? {};
  },
);

export const Artikkel12_1BegrunnelserSelector = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART12_1).begrunnelseKoder || [],
);

export const Artikkel12_2BegrunnelserSelector = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART12_2).begrunnelseKoder || [],
);

export const art16_1 = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => finnVilkår(alleVilkar, MKV.Koder.vilkaar.FO_883_2004_ART16_1),
);

export const Artikkel16_1BegrunnelserSelector = createSelector(
  (state) => art16_1(state),
  (art16_1_vilkar) => art16_1_vilkar.begrunnelseKoder || [],
);

export const Artikkel16_1FritekstSelector = createSelector(
  (state) => art16_1(state),
  (art16_1_vilkar) => art16_1_vilkar.begrunnelseFritekst,
);

export const ValgteLovvalgsVilkar = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const alleLovvalg = [
      ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004,
      ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009,
      ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia,
    ];
    return alleVilkar.filter((enkeltVilkar) =>
      alleLovvalg.find((enkeltLovvalg) => enkeltLovvalg.kode === enkeltVilkar.vilkaar),
    );
  },
);

export const ValgteTilleggsVilkar = createSelector(
  (state) => VilkarSelector(state),
  (alleVilkar) => {
    const alleTilleggsbestemmelser = [
      ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004,
      ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_konv_efta_storbritannia,
    ];
    return alleVilkar.filter((enkeltVilkar) =>
      alleTilleggsbestemmelser.find((enkeltTilleggslovvalg) => enkeltTilleggslovvalg.kode === enkeltVilkar.vilkaar),
    );
  },
);

export const VilkarBegrunnelserSelector = createSelector(
  (state) => VesentligVirksomhetSelector(state),
  (state) => NormaltDriverVirksomhetSelector(state),
  (state) => ForutgaendeMedlemskapSelector(state),
  (vesentligvirksomhet, normaltDrivervirksomhet, forutgaendemedlemskap) =>
    [
      ...(vesentligvirksomhet.begrunnelseKoder || []),
      ...(normaltDrivervirksomhet.begrunnelseKoder || []),
      ...(forutgaendemedlemskap.begrunnelseKoder || []),
    ] || [],
);
