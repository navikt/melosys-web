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

export const MottatteOpplysningerStatusSelector = createSelector(
  (state) => state.mottatteOpplysninger.status,
  (status) => status,
);

export const MottatteOpplysningerSelector = createSelector(
  (state) => state.mottatteOpplysninger.data || {},
  (mottatteOpplysninger) => mottatteOpplysninger,
);

export const MottatteOpplysningerTypeSelector = createSelector(
  (state) => MottatteOpplysningerSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.type || {},
);

export const MottatteOpplysningerDataSelector = createSelector(
  (state) => MottatteOpplysningerSelector(state),
  (mottatteOpplysningerState) => mottatteOpplysningerState.data || {},
);

export const ArbeidPaaLandSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysningerData) => mottatteOpplysningerData.arbeidPaaLand || {},
);

export const IkkeYrkesaktivSituasjontypeSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysningerData) => {
    return mottatteOpplysningerData.ikkeYrkesaktivSituasjontype || null;
  },
);

export const FysiskeArbeidsstederSelector = createSelector(
  (state) => ArbeidPaaLandSelector(state),
  (arbeidPaaLand) => arbeidPaaLand.fysiskeArbeidssteder || [],
);

const FysiskeArbeidsstederAdresserSelector = createSelector(
  (state) => FysiskeArbeidsstederSelector(state),
  (fysiskeArbeidssteder) => fysiskeArbeidssteder.map((arbeid) => arbeid.adresse) || [],
);

export const FysiskeArbeidsstederLandkoderSelector = createSelector(
  (state) => FysiskeArbeidsstederAdresserSelector(state),
  (fysiskeArbeidsstederAdresser) => fysiskeArbeidsstederAdresser.map((adresse) => adresse.landkode) || [],
);

export const ForetakUtlandSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.foretakUtland || [],
);

const ForetakUtlandAdresseSelector = createSelector(
  (state) => ForetakUtlandSelector(state),
  (foretakUtland) => foretakUtland.map((foretak) => foretak.adresse) || [],
);

export const ForetakUtlandLandkodeSelector = createSelector(
  ForetakUtlandAdresseSelector,
  (foretakUtlandAdresse) => foretakUtlandAdresse.map((adresse) => adresse.landkode) || [],
);

export const ArbeidsforholdUtlandSelector = createSelector(
  (state) => ForetakUtlandSelector(state),
  (foretakUtland) => foretakUtland.filter((arbeidsforhold) => !arbeidsforhold.selvstendigNaeringsvirksomhet),
);

export const SelvstendigNaeringsvirksomhetUtlandSelector = createSelector(
  (state) => ForetakUtlandSelector(state),
  (foretakUtland) => foretakUtland.filter((arbeidsforhold) => arbeidsforhold.selvstendigNaeringsvirksomhet),
);

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.juridiskArbeidsgiverNorge || {},
);

export const EkstraArbeidsgivereSelector = createSelector(
  JuridiskArbeidsgiverNorgeSelector,
  (juridiskArbeidsgiver) => juridiskArbeidsgiver.ekstraArbeidsgivere || [],
);

export const ValiderteEkstraArbeidsgivereSelector = createSelector(
  EkstraArbeidsgivereSelector,
  OrganisasjonSelectors.organisasjonerSelector,
  (ekstraArbeidsgivere, organisasjoner) =>
    organisasjoner.filter((organisasjon) => ekstraArbeidsgivere.includes(organisasjon.orgnr)),
);

export const SelvstendigArbeidSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.selvstendigArbeid || {},
);

export const SelvstendigArbeidForetakSelector = createSelector(
  SelvstendigArbeidSelector,
  (selvstendigArbeid) => selvstendigArbeid.selvstendigForetak || [],
);

export const SelvstendigArbeidForetakOrgnumreSelector = createSelector(
  SelvstendigArbeidForetakSelector,
  (selvstendigForetak) => selvstendigForetak.map((foretak) => foretak.orgnr),
);

export const SelvstendigNaringsvirksomhetSelector = createSelector(
  SelvstendigArbeidForetakSelector,
  OrganisasjonSelectors.organisasjonerSelector,
  (selvstendigForetak = [], organisasjoner = []) =>
    organisasjoner.filter((organisasjon) => selvstendigForetak.find((foretak) => foretak.orgnr === organisasjon.orgnr)),
);

export const OppholdUtlandSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.oppholdUtland || {},
);

export const OppholdsLandSelector = createSelector(
  OppholdUtlandSelector,
  (oppholdUtland) => oppholdUtland.oppholdslandkoder || [],
);

export const OppholdUtlandPeriodeSelector = createSelector(
  (state) => OppholdUtlandSelector(state),
  (oppholdUtland) => {
    const { oppholdsPeriode } = oppholdUtland;
    return oppholdsPeriode || {};
  },
);

export const BostedSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.bosted || {},
);

export const BostedAdresseSelector = createSelector(
  (state) => BostedSelector(state),
  (bosted) => {
    const { oppgittAdresse } = bosted;
    return oppgittAdresse || {};
  },
);

export const ArbeidsgiversBekreftelseSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.arbeidsgiversBekreftelse || {},
);

export const MaritimtArbeidSelector = createSelector(
  MottatteOpplysningerDataSelector,
  (mottatteOpplysninger) => mottatteOpplysninger.maritimtArbeid || [],
);

export const SkipArbeidSelector = createSelector(MaritimtArbeidSelector, (maritimtArbeid) =>
  maritimtArbeid.filter((enkeltArbeid) => Utils._isNil(enkeltArbeid.innretningLandkode)),
);

export const OffshoreArbeidSelector = createSelector(MaritimtArbeidSelector, (maritimtArbeid) =>
  maritimtArbeid.filter((enkeltArbeid) => !Utils._isNil(enkeltArbeid.innretningLandkode)),
);

export const LuftfartBaserSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.luftfartBaser || [],
);

export const RepresentantIUtlandetSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.representantIUtlandet,
);

export const HjemmebaserSelector = createSelector(LuftfartBaserSelector, (luftfartBaser) =>
  luftfartBaser.map((base) => base.hjemmebaseLand).filter((base) => base),
);

export const SoknadslandSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.soeknadsland || {},
);

export const SoknadslandkoderSelector = createSelector(
  (state) => SoknadslandSelector(state),
  (soknadsland) => soknadsland.landkoder || [],
);

export const SoknadslandFlereLandUkjentHvilkeSelector = createSelector(
  (state) => SoknadslandSelector(state),
  (soknadsland) => soknadsland.flereLandUkjentHvilke,
);

export const SoknadslandKTSelector = createSelector(
  (state) => SoknadslandkoderSelector(state),
  (soknadsland) => MKV.KTObjects.land_iso2.filter((landkodeObjekt) => soknadsland.includes(landkodeObjekt.kode)),
);

export const TrygdedekningSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.trygdedekning,
);

export const AvsenderlandSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.avsenderland,
);

export const LovvalgslandSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.lovvalgsland,
);

export const PeriodeSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.periode || {},
);

export const ArbeidsgiverOgArbeidstakerHarUlikPeriodeSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.arbeidsgiverOgArbeidstakerHarUlikPeriode === true,
);

export const PeriodeFomSelector = createSelector(
  (state) => PeriodeSelector(state),
  (soknadsperiode) => soknadsperiode.fom,
);

export const PeriodeTomSelector = createSelector(
  (state) => PeriodeSelector(state),
  (soknadsperiode) => soknadsperiode.tom,
);

export const HarPeriodeSelector = createSelector(
  (state) => PeriodeFomSelector(state),
  (periodeFom) => !Utils._isEmpty(periodeFom),
);

export const HarLandSelector = createSelector(
  (state) => SoknadslandSelector(state),
  (soeknadsland) => !Utils._isEmpty(soeknadsland.landkoder) || soeknadsland.flereLandUkjentHvilke,
);

export const HarPeriodeOgLandSelector = createSelector(
  (state) => HarPeriodeSelector(state),
  (state) => HarLandSelector(state),
  (harPeriode, harLand) => harPeriode && harLand,
);

export const PersonOpplysningerSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysninger) => mottatteOpplysninger.personOpplysninger || {},
);

export const MedfolgendeFamilieSelector = createSelector(
  (state) => PersonOpplysningerSelector(state),
  (personopplysninger) => personopplysninger.medfolgendeFamilie || [],
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
      })),
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
      })),
);

export const OvergangsregelbestemmelserSelector = createSelector(
  MottatteOpplysningerDataSelector,
  (mottatteOpplysningerData) => mottatteOpplysningerData.overgangsregelbestemmelser || [],
);

export const YtterligereInformasjonSelector = createSelector(
  MottatteOpplysningerDataSelector,
  (mottatteOpplysningerData) => mottatteOpplysningerData.ytterligereInformasjon,
);

export const LonnOgGodtgjorelseSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysningerData) =>
    mottatteOpplysningerData.loennOgGodtgjoerelse || {
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
    },
);

export const ArbeidssituasjonOgOevrigSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysningerData) => mottatteOpplysningerData.arbeidssituasjonOgOevrig || {},
);

export const UtenlandsoppdragetSelector = createSelector(
  (state) => MottatteOpplysningerDataSelector(state),
  (mottatteOpplysningerData) =>
    mottatteOpplysningerData.utenlandsoppdraget || {
      erUtsendelseForOppdragIUtlandet: null,
      erAnsattForOppdragIUtlandet: null,
      erFortsattAnsattEtterOppdraget: null,
      erDrattPaaEgetInitiativ: null,
      erErstatningTidligereUtsendte: null,
      samletUtsendingsperiode: { fom: null, tom: null },
    },
);
