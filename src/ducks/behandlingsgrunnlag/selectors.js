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
  (state) => BehandlingsgrunnlagSelector(state),
  (behandlingsgrunnlag) => behandlingsgrunnlag.type
);

export const BehandlingsgrunnlagDataSelector = createSelector(
  (state) => BehandlingsgrunnlagSelector(state),
  (behandlingsgrunnlagState) => behandlingsgrunnlagState.data || {}
);

export const ArbeidPaaLandSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
  (behandlingsgrunnlagData) => behandlingsgrunnlagData.arbeidPaaLand || {}
);

export const FysiskeArbeidsstederSelector = createSelector(
  (state) => ArbeidPaaLandSelector(state),
  (arbeidPaaLand) => arbeidPaaLand.fysiskeArbeidssteder || []
);

const FysiskeArbeidsstederAdresserSelector = createSelector(
  (state) => FysiskeArbeidsstederSelector(state),
  (fysiskeArbeidssteder) => fysiskeArbeidssteder.map((arbeid) => arbeid.adresse) || []
);

export const FysiskeArbeidsstederLandkoderSelector = createSelector(
  (state) => FysiskeArbeidsstederAdresserSelector(state),
  (fysiskeArbeidsstederAdresser) => fysiskeArbeidsstederAdresser.map((adresse) => adresse.landkode) || []
);

export const ForetakUtlandSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
  (behandlingsgrunnlag) => behandlingsgrunnlag.foretakUtland || []
);

const ForetakUtlandAdresseSelector = createSelector(
  (state) => ForetakUtlandSelector(state),
  (foretakUtland) => foretakUtland.map((foretak) => foretak.adresse) || []
);

export const ForetakUtlandLandkodeSelector = createSelector(
  ForetakUtlandAdresseSelector,
  (foretakUtlandAdresse) => foretakUtlandAdresse.map((adresse) => adresse.landkode) || []
);

export const ArbeidsforholdUtlandSelector = createSelector(
  (state) => ForetakUtlandSelector(state),
  (foretakUtland) => foretakUtland.filter((arbeidsforhold) => !arbeidsforhold.selvstendigNaeringsvirksomhet)
);

export const SelvstendigNaeringsvirksomhetUtlandSelector = createSelector(
  (state) => ForetakUtlandSelector(state),
  (foretakUtland) => foretakUtland.filter((arbeidsforhold) => arbeidsforhold.selvstendigNaeringsvirksomhet)
);

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
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
  (state) => BehandlingsgrunnlagDataSelector(state),
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
  (selvstendigForetak = [], organisasjoner = []) =>
    organisasjoner.filter((organisasjon) => selvstendigForetak.find((foretak) => foretak.orgnr === organisasjon.orgnr))
);

export const OppholdUtlandSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
  (behandlingsgrunnlag) => behandlingsgrunnlag.oppholdUtland || {}
);

export const OppholdsLandSelector = createSelector(
  OppholdUtlandSelector,
  (oppholdUtland) => oppholdUtland.oppholdslandkoder || []
);

export const OppholdsLandKTSelector = createSelector(OppholdsLandSelector, (oppholdsLand) =>
  MKV.KTObjects.landkoder.filter((landkodeObjekt) => oppholdsLand.includes(landkodeObjekt.kode))
);

export const OppholdUtlandPeriodeSelector = createSelector(
  (state) => OppholdUtlandSelector(state),
  (oppholdUtland) => {
    const { oppholdsPeriode } = oppholdUtland;
    return oppholdsPeriode || {};
  }
);

export const BostedSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
  (behandlingsgrunnlag) => behandlingsgrunnlag.bosted || {}
);

export const BostedAdresseSelector = createSelector(
  (state) => BostedSelector(state),
  (bosted) => {
    const { oppgittAdresse } = bosted;
    return oppgittAdresse || {};
  }
);

export const ArbeidsgiversBekreftelseSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
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
  (state) => BehandlingsgrunnlagDataSelector(state),
  (behandlingsgrunnlag) => behandlingsgrunnlag.luftfartBaser || []
);

export const RepresentantIUtlandetSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
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
  MKV.KTObjects.land_iso2.filter((landkodeObjekt) => soknadsland.includes(landkodeObjekt.kode))
);

export const TrygdedekningSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
  (behandlingsgrunnlag) => behandlingsgrunnlag.trygdedekning
);

export const PeriodeSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
  (behandlingsgrunnlag) => behandlingsgrunnlag.periode || {}
);

export const PeriodeFomSelector = createSelector(
  (state) => PeriodeSelector(state),
  (soknadsperiode) => soknadsperiode.fom
);

export const PeriodeTomSelector = createSelector(
  (state) => PeriodeSelector(state),
  (soknadsperiode) => soknadsperiode.tom
);

export const HarPeriodeSelector = createSelector(
  (state) => PeriodeFomSelector(state),
  (periodeFom) => !Utils._isEmpty(periodeFom)
);

export const HarLandSelector = createSelector(
  SoknadslandSelector,
  (soeknadsland) => !Utils._isEmpty(soeknadsland.landkoder) || soeknadsland.erUkjenteEllerAlleEosLand
);

export const HarPeriodeOgLandSelector = createSelector(
  HarPeriodeSelector,
  HarLandSelector,
  (harPeriode, harLand) => harPeriode && harLand
);

export const PersonOpplysningerSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
  (behandlingsgrunnlag) => behandlingsgrunnlag.personOpplysninger || {}
);

export const MedfolgendeFamilieSelector = createSelector(
  (state) => PersonOpplysningerSelector(state),
  (personopplysninger) => personopplysninger.medfolgendeFamilie || []
);

export const MedfolgendeBarnSelector = createSelector(
  (state) => MedfolgendeFamilieSelector(state),
  (medfolgendeFamilie) =>
    medfolgendeFamilie
      .filter((person) => person.relasjonsrolle === KV.Koder.Relasjonsrolle.BARN)
      .map((person) => ({
        uuid: person.uuid,
        navn: person.navn,
        fnr: person.fnr,
      }))
);

export const MedfolgendeEktefelleSamboerSelector = createSelector(
  (state) => MedfolgendeFamilieSelector(state),
  (medfolgendeFamilie) =>
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
  (state) => BehandlingsgrunnlagSelector(state),
  (behandlingsgrunnlagData) => behandlingsgrunnlagData.mottaksdato || ""
);

export const LonnOgGodtgjorelseSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
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
  (state) => BehandlingsgrunnlagDataSelector(state),
  (behandlingsgrunnlagData) => behandlingsgrunnlagData.arbeidssituasjonOgOevrig || {}
);

export const UtenlandsoppdragetSelector = createSelector(
  (state) => BehandlingsgrunnlagDataSelector(state),
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
