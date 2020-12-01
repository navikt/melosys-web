import { createSelector } from 'reselect';

import * as Utils from '../../utils';
import * as KV from '../../kodeverk';

import { OrganisasjonSelectors } from '../organisasjoner';

import MKV from '../../melosyskodeverk';

/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

export const BehandlingsgrunnlagSelector = createSelector(
  state => state.behandlingsgrunnlag.data,
  behandlingsgrunnlag => behandlingsgrunnlag
);

export const BehandlingsgrunnlagtypeSelector = createSelector(
  BehandlingsgrunnlagSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.type
);

export const BehandlingsgrunnlagDataSelector = createSelector(
  BehandlingsgrunnlagSelector,
  behandlingsgrunnlagState => behandlingsgrunnlagState.data || {}
);

export const ArbeidUtlandSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.arbeidUtland || []
);

const ArbeidUtlandAdresseSelector = createSelector(
  ArbeidUtlandSelector,
  arbeidUtland => arbeidUtland.map(arbeid => arbeid.adresse) || []
);

export const ArbeidUtlandLandkodeSelector = createSelector(
  ArbeidUtlandAdresseSelector,
  arbeidUtlandAdresse => arbeidUtlandAdresse.map(adresse => adresse.landkode) || []
);

export const ArbeidsinntektSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.arbeidsinntekt || {}
);

export const ArbeidsinntektNaturalytelserSelector = createSelector(
  ArbeidsinntektSelector,
  arbeidsinntekt => arbeidsinntekt.inntektNaturalytelser || {}
);

export const ForetakUtlandSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.foretakUtland || []
);

const ForetakUtlandAdresseSelector = createSelector(
  ForetakUtlandSelector,
  foretakUtland => foretakUtland.map(foretak => foretak.adresse) || []
);

export const ForetakUtlandLandkodeSelector = createSelector(
  ForetakUtlandAdresseSelector,
  foretakUtlandAdresse => foretakUtlandAdresse.map(adresse => adresse.landkode) || []
);

export const ArbeidsforholdUtlandSelector = createSelector(
  ForetakUtlandSelector,
  foretakUtland => foretakUtland.filter(arbeidsforhold => !arbeidsforhold.selvstendigNaeringsvirksomhet)
);

export const SelvstendigNaeringsvirksomhetUtlandSelector = createSelector(
  ForetakUtlandSelector,
  foretakUtland => foretakUtland.filter(arbeidsforhold => arbeidsforhold.selvstendigNaeringsvirksomhet)
);

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.juridiskArbeidsgiverNorge || {}
);

export const EkstraArbeidsgivereSelector = createSelector(
  JuridiskArbeidsgiverNorgeSelector,
  juridiskArbeidsgiver => juridiskArbeidsgiver.ekstraArbeidsgivere || []
);

export const ValiderteEkstraArbeidsgivereSelector = createSelector(
  EkstraArbeidsgivereSelector,
  OrganisasjonSelectors.organisasjonerSelector,
  (ekstraArbeidsgivere, organisasjoner) => organisasjoner.filter(organisasjon => ekstraArbeidsgivere.includes(organisasjon.orgnr))
);

export const SelvstendigArbeidSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.selvstendigArbeid || {}
);

export const SelvstendigArbeidForetakSelector = createSelector(
  SelvstendigArbeidSelector,
  selvstendigArbeid => selvstendigArbeid.selvstendigForetak || []
);

export const SelvstendigArbeidForetakOrgnumreSelector = createSelector(
  SelvstendigArbeidForetakSelector,
  selvstendigForetak => selvstendigForetak.map(foretak => foretak.orgnr)
);

export const SelvstendigNaringsvirksomhetSelector = createSelector(
  SelvstendigArbeidForetakSelector,
  OrganisasjonSelectors.organisasjonerSelector,
  (selvstendigForetak = [], organisasjoner) => organisasjoner.filter(organisasjon => selvstendigForetak.find(foretak => foretak.orgnr === organisasjon.orgnr))
);

export const OppholdUtlandSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.oppholdUtland || {}
);

export const OppholdsLandSelector = createSelector(
  OppholdUtlandSelector,
  oppholdUtland => oppholdUtland.oppholdslandkoder || []
);

export const OppholdsLandKTSelector = createSelector(
  OppholdsLandSelector,
  oppholdsLand => MKV.KTObjects.landkoder.filter(landkodeObjekt => oppholdsLand.includes(landkodeObjekt.kode))
);

export const OppholdUtlandPeriodeSelector = createSelector(
  OppholdUtlandSelector,
  oppholdUtland => {
    const { oppholdsPeriode } = oppholdUtland;
    return oppholdsPeriode || {};
  }
);

export const BostedSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.bosted || {}
);

export const BostedAdresseSelector = createSelector(
  BostedSelector,
  bosted => {
    const { oppgittAdresse } = bosted;
    return oppgittAdresse || {};
  }
);

export const ArbeidsgiversBekreftelseSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.arbeidsgiversBekreftelse || {}
);

export const MaritimtArbeidSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.maritimtArbeid || []
);

export const SkipArbeidSelector = createSelector(
  MaritimtArbeidSelector,
  maritimtArbeid => maritimtArbeid.filter(enkeltArbeid => Utils._isNil(enkeltArbeid.installasjonsLandkode))
);

export const OffshoreArbeidSelector = createSelector(
  MaritimtArbeidSelector,
  maritimtArbeid => maritimtArbeid.filter(enkeltArbeid => !Utils._isNil(enkeltArbeid.installasjonsLandkode))
);

export const LuftfartBaserSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.luftfartBaser || []
);

export const HjemmebaserSelector = createSelector(
  LuftfartBaserSelector,
  luftfartBaser => luftfartBaser
    .map(base => base.hjemmebaseLand)
    .filter(base => base)
);

export const SoknadslandSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => (behandlingsgrunnlag.soeknadsland ? behandlingsgrunnlag.soeknadsland.landkoder : [])
);

export const PeriodeSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.periode || {}
);

export const PeriodeFomSelector = createSelector(
  PeriodeSelector,
  soknadsperiode => soknadsperiode.fom
);

export const PeriodeTomSelector = createSelector(
  PeriodeSelector,
  soknadsperiode => soknadsperiode.tom
);

export const PersonOpplysningerSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.personOpplysninger || {}
);

export const MedfolgendeFamilieSelector = createSelector(
  PersonOpplysningerSelector,
  personopplysninger => personopplysninger.medfolgendeFamilie || []
);

export const MedfolgendeBarnSelector = createSelector(
  MedfolgendeFamilieSelector,
  medfolgendeFamilie => medfolgendeFamilie.filter(person => (
    person.relasjonsrolle === KV.Koder.Relasjonsrolle.BARN
  ))
);

export const OvergangsregelbestemmelserSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlagData => behandlingsgrunnlagData.overgangsregelbestemmelser
);

export const YtterligereInformasjonSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlagData => behandlingsgrunnlagData.ytterligereInformasjon
);
