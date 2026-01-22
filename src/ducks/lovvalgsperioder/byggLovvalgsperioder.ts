import MKV from "../../melosyskodeverk";
import * as KV from "../../kodeverk";
import * as Actions from "./actions";
import * as Selectors from "./selectors";

import { anmodningsperioderSelectors } from "../anmodningsperioder";
import { mottatteOpplysningerSelectors } from "../mottatteOpplysninger";
import { vilkarSelectors } from "../vilkar";
import { avklartefaktaSelectors } from "../avklartefakta";
import { lovvalgsperioderSelectors } from "./index";
import { behandlingerSelectors } from "../behandlinger";
import { flytSelectors } from "../flyt";
import { formSelectors } from "../form";
import { ThunkDispatch } from "redux-thunk";
import { RootState } from "AppTypes";
import * as Types from "./types";
import { Vilkaar } from "../../services/modules/vilkar";
import { Lovvalgsperiode } from "../../services/modules/lovvalgsperioder";
import { PerioderStegState } from "../../felleskomponenter/stegvelger";

/* Hjelpefunksjoner
 * Disse eksponeres ikke utad, men er kun ment for å bryte opp komplisert logikk og gjøre
 * koden mer lesbar.
 */

const finnOppfyltVilkar = (alleLovvalgsVilkar: Vilkaar[]): string | undefined => {
  const vilkarObjekt = alleLovvalgsVilkar.find((enkeltLovvalg) => enkeltLovvalg.oppfylt);
  return vilkarObjekt?.vilkaar;
};

const byggLovvalgsperiodeUtsending = (stegState: PerioderStegState, reduxState: RootState): Lovvalgsperiode[] => {
  const søknadsperiode = mottatteOpplysningerSelectors.PeriodeSelector(reduxState);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);
  return [
    {
      fomDato: søknadsperiode.fom,
      tomDato: søknadsperiode.tom,
      lovvalgsbestemmelse: stegState.lovvalgsbestemmelse,
      medlemskapsperiodeID,
      tilleggBestemmelse: stegState.tilleggbestemmelse,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
      lovvalgsland: MKV.Koder.landkoder.NO,
      trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
      medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
    },
  ];
};

const byggLovvalgsperiodeArtikkel113Aeller133A = (
  stegState: PerioderStegState,
  reduxState: RootState,
  oppfyltLovvalg: string,
): Lovvalgsperiode[] => {
  const søknadsperiode = mottatteOpplysningerSelectors.PeriodeSelector(reduxState);
  const tilleggsbestemmelseFraVilkar = finnOppfyltVilkar(vilkarSelectors.ValgteTilleggsVilkar(reduxState));
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);
  return [
    {
      fomDato: søknadsperiode.fom,
      tomDato: søknadsperiode.tom,
      lovvalgsbestemmelse: oppfyltLovvalg,
      medlemskapsperiodeID: medlemskapsperiodeID || null,
      tilleggBestemmelse: stegState.tilleggbestemmelse || tilleggsbestemmelseFraVilkar,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
      lovvalgsland: MKV.Koder.landkoder.NO,
      trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
      medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
    },
  ];
};

const byggLovvalgsperiodeArtikkel1142eller1342 = (
  stegState: PerioderStegState,
  reduxState: RootState,
  oppfyltLovvalg: string,
): Lovvalgsperiode[] => {
  const søknadsperiode = mottatteOpplysningerSelectors.PeriodeSelector(reduxState);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);
  return [
    {
      fomDato: søknadsperiode.fom,
      tomDato: søknadsperiode.tom,
      lovvalgsbestemmelse: oppfyltLovvalg,
      medlemskapsperiodeID: medlemskapsperiodeID || null,
      tilleggBestemmelse: stegState.tilleggbestemmelse,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
      lovvalgsland: MKV.Koder.landkoder.NO,
      trygdeDekning: MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO,
      medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
    },
  ];
};

const byggLovvalgsperiodeArtikkelUnntak = (reduxState: RootState): Lovvalgsperiode[] => {
  const erAnmodningsperiodeSendtUtland =
    anmodningsperioderSelectors.AnmodningsperioderErSendtUtlandetSelector(reduxState);
  const erBehandlingsstatusUnderBehandlingAvsluttetEllerMottattSvarPåAnmodning = [
    MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    MKV.Koder.behandlinger.behandlingsstatus.SVAR_ANMODNING_MOTTATT,
    MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET,
  ].includes(behandlingerSelectors.BehandlingsstatusKodeSelector(reduxState));

  // Anmodning om unntak har ikke lovvalgsperiode før avsluttet behandling. Før det har de bare anmodningsperiode.
  if (erAnmodningsperiodeSendtUtland && erBehandlingsstatusUnderBehandlingAvsluttetEllerMottattSvarPåAnmodning) {
    return Selectors.LovvalgsperioderSelector(reduxState);
  }
  return [];
};

const byggAvslaattLovvalgsperiode = (reduxState: RootState, lovvalgsbestemmelse: string | undefined) => {
  const periode = mottatteOpplysningerSelectors.PeriodeSelector(reduxState);
  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);

  return [
    {
      fomDato: periode.fom,
      tomDato: periode.tom,
      lovvalgsbestemmelse,
      medlemskapsperiodeID: medlemskapsperiodeID || null,
      tilleggBestemmelse: null,
      unntakFraBestemmelse: null,
      unntakFraLovvalgsland: null,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.AVSLAATT,
      lovvalgsland: null,
      trygdeDekning: MKV.Koder.trygdedekninger.UTEN_DEKNING,
      medlemskapstype: null,
    },
  ];
};

const hentLovvalgsbestemmelseForAvslag = (reduxState: RootState) => {
  if (
    avklartefaktaSelectors.YrkesaktivitetSelector(reduxState) ===
    KV.Koder.VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE
  ) {
    return MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_2;
  }
  return MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1;
};

const byggLovvalgsperioderFraVilkaar = (
  oppfyltLovvalg: string | undefined,
  stegState: PerioderStegState,
  reduxState: RootState,
) => {
  if (!oppfyltLovvalg) {
    return byggAvslaattLovvalgsperiode(reduxState, hentLovvalgsbestemmelseForAvslag(reduxState));
  }

  switch (oppfyltLovvalg) {
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1:
      return byggLovvalgsperiodeUtsending(stegState, reduxState);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_2:
      return byggLovvalgsperiodeUtsending(stegState, reduxState);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART14_1:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART14_2:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART16_1:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART16_3:
      return byggLovvalgsperiodeUtsending(stegState, reduxState);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A:
      return byggLovvalgsperiodeArtikkel113Aeller133A(stegState, reduxState, oppfyltLovvalg);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART13_3A:
      return byggLovvalgsperiodeArtikkel113Aeller133A(stegState, reduxState, oppfyltLovvalg);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_4_2:
      return byggLovvalgsperiodeArtikkel1142eller1342(stegState, reduxState, oppfyltLovvalg);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART13_4_2:
      return byggLovvalgsperiodeArtikkel1142eller1342(stegState, reduxState, oppfyltLovvalg);
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART18_1:
      return byggLovvalgsperiodeArtikkelUnntak(reduxState);
    default: {
      return [];
    }
  }
};

const bestemLovvalgsland = (lovvalgsbestemmelse: string | undefined, reduxState: RootState) => {
  if (flytSelectors.HarOffentligTjenesteINorgeSelector(reduxState)) return MKV.Koder.landkoder.NO;
  if (avklartefaktaSelectors.OmfattesINorgeSelector(reduxState)) return MKV.Koder.landkoder.NO;

  switch (lovvalgsbestemmelse) {
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2A:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A:
    case MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B:
      return MKV.Koder.landkoder.NO;
    default:
      return null;
  }
};

const lovvalgsperiodeSkalVaereTom = (lovvalgsbestemmelse: string | undefined, reduxState: RootState) =>
  lovvalgsbestemmelse === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1 ||
  lovvalgsbestemmelse ===
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART18_1 ||
  avklartefaktaSelectors.OmfattesIAnnetLandSelector(reduxState) ||
  flytSelectors.HarOffentligTjenesteAnnetLandSelector(reduxState) ||
  flytSelectors.HarLonnetArbeidAnnetLand(reduxState) ||
  formSelectors.UtpekingAvvistSelector(reduxState);

const bestemPeriode = (reduxState: RootState) => {
  const periode = Selectors.PeriodeSelector(reduxState);
  if (periode.tom || periode.fom) return periode;

  return mottatteOpplysningerSelectors.PeriodeSelector(reduxState);
};

const erNorgeLovvalgsland = (lovvalgsland: string | undefined) => lovvalgsland === MKV.Koder.landkoder.NO;

const byggLovvalgsperioder = (stegState: PerioderStegState, reduxState: RootState) => {
  if (lovvalgsperiodeSkalVaereTom(stegState.lovvalgsbestemmelse, reduxState)) return [];

  const medlemskapsperiodeID = lovvalgsperioderSelectors.MedlemskapsperiodeIDSelector(reduxState);
  const lovvalgsland = stegState.lovvalgsland || bestemLovvalgsland(stegState.lovvalgsbestemmelse, reduxState);
  const unntakFraBestemmelse = stegState.unntakfrabestemmelse;
  const periode = bestemPeriode(reduxState);
  const fomDato = (stegState.lovvalgsperiode ? stegState.lovvalgsperiode.fomDato : null) || periode.fom;
  const tomDato = (stegState.lovvalgsperiode ? stegState.lovvalgsperiode.tomDato : null) || periode.tom;

  return [
    {
      fomDato,
      tomDato,
      lovvalgsbestemmelse: stegState.lovvalgsbestemmelse || null,
      medlemskapsperiodeID: medlemskapsperiodeID || null,
      tilleggBestemmelse: stegState.tilleggbestemmelse || null,
      unntakFraBestemmelse: unntakFraBestemmelse || null,
      unntakFraLovvalgsland: null,
      innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
      lovvalgsland,
      trygdeDekning: erNorgeLovvalgsland(lovvalgsland)
        ? MKV.Koder.trygdedekninger.FULL_DEKNING_EOSFO
        : MKV.Koder.trygdedekninger.UTEN_DEKNING,
      medlemskapstype: erNorgeLovvalgsland(lovvalgsland)
        ? MKV.Koder.medlemskapstyper.PLIKTIG
        : MKV.Koder.medlemskapstyper.UNNTATT,
    },
  ];
};

export function oppdaterLovvalgsperioderState(stegState: PerioderStegState) {
  return (dispatch: ThunkDispatch<RootState, unknown, Types.Action>, getState: () => RootState) => {
    const reduxState = getState();
    const alleLovvalgsvilkar = vilkarSelectors.ValgteLovvalgsVilkar(reduxState);

    if (alleLovvalgsvilkar.length > 0) {
      const oppfyltLovvalg = finnOppfyltVilkar(alleLovvalgsvilkar);
      const lovvalgsperioder = byggLovvalgsperioderFraVilkaar(oppfyltLovvalg, stegState, reduxState);
      // @ts-expect-error generisk beskrivelse
      dispatch(Actions.oppdaterLovvalgsperioderState(lovvalgsperioder));
    } else if (
      stegState.lovvalgsbestemmelse ||
      stegState.tilleggbestemmelse ||
      stegState.unntakfrabestemmelse ||
      stegState.lovvalgsland ||
      stegState.lovvalgsperiode
    ) {
      const lovvalgsperioder = byggLovvalgsperioder(stegState, reduxState);
      // @ts-expect-error generisk beskrivelse
      dispatch(Actions.oppdaterLovvalgsperioderState(lovvalgsperioder));
    } else {
      dispatch(Actions.resetLovvalgsperioderState());
    }
  };
}
