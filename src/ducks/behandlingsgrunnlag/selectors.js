import { createSelector } from "reselect";

import * as Utils from "../../utils";
import * as KV from "../../kodeverk";

import { OrganisasjonSelectors } from "../organisasjoner";

import MKV from "../../melosyskodeverk";

/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

export const BehandlingsgrunnlagStatusSelector = createSelector(
  (state) => state.behandlingsgrunnlag.status,
  (status) => status
);

export const BehandlingsgrunnlagSelector = createSelector(
  (state) => state.behandlingsgrunnlag.data,
  (behandlingsgrunnlag) => behandlingsgrunnlag
);

export const BehandlingsgrunnlagtypeSelector = createSelector(
  BehandlingsgrunnlagSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.type
);

export const BehandlingsgrunnlagDataSelector = createSelector(
  BehandlingsgrunnlagSelector,
  (behandlingsgrunnlagState) => behandlingsgrunnlagState.data || {}
);

export const ArbeidPaaLandSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlagData) => behandlingsgrunnlagData.arbeidPaaLand || {}
);

export const FysiskeArbeidsstederSelector = createSelector(
  ArbeidPaaLandSelector,
  (arbeidPaaLand) => arbeidPaaLand.fysiskeArbeidssteder || []
);

const FysiskeArbeidsstederAdresserSelector = createSelector(
  FysiskeArbeidsstederSelector,
  (fysiskeArbeidssteder) => fysiskeArbeidssteder.map((arbeid) => arbeid.adresse) || []
);

export const FysiskeArbeidsstederLandkoderSelector = createSelector(
  FysiskeArbeidsstederAdresserSelector,
  (fysiskeArbeidsstederAdresser) => fysiskeArbeidsstederAdresser.map((adresse) => adresse.landkode) || []
);

export const ForetakUtlandSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.foretakUtland || []
);

const ForetakUtlandAdresseSelector = createSelector(
  ForetakUtlandSelector,
  (foretakUtland) => foretakUtland.map((foretak) => foretak.adresse) || []
);

export const ForetakUtlandLandkodeSelector = createSelector(
  ForetakUtlandAdresseSelector,
  (foretakUtlandAdresse) => foretakUtlandAdresse.map((adresse) => adresse.landkode) || []
);

export const ArbeidsforholdUtlandSelector = createSelector(ForetakUtlandSelector, (foretakUtland) =>
  foretakUtland.filter((arbeidsforhold) => !arbeidsforhold.selvstendigNaeringsvirksomhet)
);

export const SelvstendigNaeringsvirksomhetUtlandSelector = createSelector(ForetakUtlandSelector, (foretakUtland) =>
  foretakUtland.filter((arbeidsforhold) => arbeidsforhold.selvstendigNaeringsvirksomhet)
);

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.juridiskArbeidsgiverNorge || {}
);

export const EkstraArbeidsgivereSelector = createSelector(
  JuridiskArbeidsgiverNorgeSelector,
  (juridiskArbeidsgiver) => juridiskArbeidsgiver.ekstraArbeidsgivere || []
);

export const ValiderteEkstraArbeidsgivereSelector = createSelector(
  EkstraArbeidsgivereSelector,
  OrganisasjonSelectors.organisasjonerSelector,
  (ekstraArbeidsgivere, organisasjoner) =>
    organisasjoner.filter((organisasjon) => ekstraArbeidsgivere.includes(organisasjon.orgnr))
);

export const SelvstendigArbeidSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.selvstendigArbeid || {}
);

export const SelvstendigArbeidForetakSelector = createSelector(
  SelvstendigArbeidSelector,
  (selvstendigArbeid) => selvstendigArbeid.selvstendigForetak || []
);

export const SelvstendigArbeidForetakOrgnumreSelector = createSelector(
  SelvstendigArbeidForetakSelector,
  (selvstendigForetak) => selvstendigForetak.map((foretak) => foretak.orgnr)
);

export const SelvstendigNaringsvirksomhetSelector = createSelector(
  SelvstendigArbeidForetakSelector,
  OrganisasjonSelectors.organisasjonerSelector,
  (selvstendigForetak = [], organisasjoner) =>
    organisasjoner.filter((organisasjon) => selvstendigForetak.find((foretak) => foretak.orgnr === organisasjon.orgnr))
);

export const OppholdUtlandSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.oppholdUtland || {}
);

export const OppholdsLandSelector = createSelector(
  OppholdUtlandSelector,
  (oppholdUtland) => oppholdUtland.oppholdslandkoder || []
);

export const OppholdsLandKTSelector = createSelector(OppholdsLandSelector, (oppholdsLand) =>
  MKV.KTObjects.landkoder.filter((landkodeObjekt) => oppholdsLand.includes(landkodeObjekt.kode))
);

export const OppholdUtlandPeriodeSelector = createSelector(OppholdUtlandSelector, (oppholdUtland) => {
  const { oppholdsPeriode } = oppholdUtland;
  return oppholdsPeriode || {};
});

export const BostedSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.bosted || {}
);

export const BostedAdresseSelector = createSelector(BostedSelector, (bosted) => {
  const { oppgittAdresse } = bosted;
  return oppgittAdresse || {};
});

export const ArbeidsgiversBekreftelseSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.arbeidsgiversBekreftelse || {}
);

export const MaritimtArbeidSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.maritimtArbeid || []
);

export const SkipArbeidSelector = createSelector(MaritimtArbeidSelector, (maritimtArbeid) =>
  maritimtArbeid.filter((enkeltArbeid) => Utils._isNil(enkeltArbeid.innretningLandkode))
);

export const OffshoreArbeidSelector = createSelector(MaritimtArbeidSelector, (maritimtArbeid) =>
  maritimtArbeid.filter((enkeltArbeid) => !Utils._isNil(enkeltArbeid.innretningLandkode))
);

export const LuftfartBaserSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.luftfartBaser || []
);

export const RepresentantIUtlandetSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.representantIUtlandet
);

export const HjemmebaserSelector = createSelector(LuftfartBaserSelector, (luftfartBaser) =>
  luftfartBaser.map((base) => base.hjemmebaseLand).filter((base) => base)
);

export const SoknadslandSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.soeknadsland || {}
);

export const SoknadslandkoderSelector = createSelector(
  SoknadslandSelector,
  (soknadsland) => soknadsland.landkoder || []
);

export const SoknadslandErUkjenteEllerAlleEosLandSelector = createSelector(
  SoknadslandSelector,
  (soknadsland) => soknadsland.erUkjenteEllerAlleEosLand
);

export const SoknadslandKTSelector = createSelector(SoknadslandkoderSelector, (soknadsland) =>
  MKV.KTObjects.landkoder.filter((landkodeObjekt) => soknadsland.includes(landkodeObjekt.kode))
);

export const TrygdedekningSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.trygdedekning
);

export const PeriodeSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.periode || {}
);

export const PeriodeFomSelector = createSelector(PeriodeSelector, (soknadsperiode) => soknadsperiode.fom);

export const PeriodeTomSelector = createSelector(PeriodeSelector, (soknadsperiode) => soknadsperiode.tom);

export const PersonOpplysningerSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlag) => behandlingsgrunnlag.personOpplysninger || {}
);

export const MedfolgendeFamilieSelector = createSelector(
  PersonOpplysningerSelector,
  (personopplysninger) => personopplysninger.medfolgendeFamilie || []
);

export const MedfolgendeBarnSelector = createSelector(MedfolgendeFamilieSelector, (medfolgendeFamilie) =>
  medfolgendeFamilie
    .filter((person) => person.relasjonsrolle === KV.Koder.Relasjonsrolle.BARN)
    .map((person) => ({
      uuid: person.uuid,
      navn: person.navn,
      fnr: person.fnr,
    }))
);

export const MedfolgendeEktefelleSamboerSelector = createSelector(MedfolgendeFamilieSelector, (medfolgendeFamilie) =>
  medfolgendeFamilie
    .filter((person) => person.relasjonsrolle === KV.Koder.Relasjonsrolle.EKTEFELLE_SAMBOER)
    .map((person) => ({
      uuid: person.uuid,
      navn: person.navn,
      fnr: person.fnr,
    }))
);

export const OvergangsregelbestemmelserSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlagData) => behandlingsgrunnlagData.overgangsregelbestemmelser
);

export const YtterligereInformasjonSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlagData) => behandlingsgrunnlagData.ytterligereInformasjon
);

export const MottaksdatoSelector = createSelector(
  BehandlingsgrunnlagSelector,
  (behandlingsgrunnlagData) => behandlingsgrunnlagData.mottaksdato || ""
);

export const LonnOgGodtgjorelseSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlagData) =>
    behandlingsgrunnlagData.loennOgGodtgjoerelse || {
      norskArbgUtbetalerLoenn: null,
      erArbeidstakerAnsattHelePerioden: null,
      utlArbgUtbetalerLoenn: null,
      bruttoLoennPerMnd: null,
      bruttoLoennUtlandPerMnd: null,
      mottarNaturalytelser: null,
      samletVerdiNaturalytelser: null,
      utlArbTilhoererSammeKonsern: null,
      erArbeidsgiveravgiftHelePerioden: null,
      erTrukketTrygdeavgift: null,
    }
);

export const ArbeidssituasjonOgOevrigSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlagData) => behandlingsgrunnlagData.arbeidssituasjonOgOevrig || {}
);

export const UtenlandsoppdragetSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  (behandlingsgrunnlagData) =>
    behandlingsgrunnlagData.utenlandsoppdraget || {
      erUtsendelseForOppdragIUtlandet: null,
      erAnsattForOppdragIUtlandet: null,
      erFortsattAnsattEtterOppdraget: null,
      erDrattPaaEgetInitiativ: null,
      erErstatningTidligereUtsendte: null,
      samletUtsendingsperiode: { fom: null, tom: null },
    }
);
