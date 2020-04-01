import { createSelector } from 'reselect';

import { OrganisasjonSelectors } from '../organisasjoner';

import { PersonSelectors } from '../personer';
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

export const BehandlingsgrunnlagDataSelector = createSelector(
  BehandlingsgrunnlagSelector,
  behandlingsgrunnlagState => behandlingsgrunnlagState.data || {}
);

export const ArbeidNorgeSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.arbeidNorge || {}
);

export const ArbeidUtlandSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.arbeidUtland || []
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

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.juridiskArbeidsgiverNorge || {}
);

export const EkstraArbeidsgivereSelector = createSelector(
  JuridiskArbeidsgiverNorgeSelector,
  OrganisasjonSelectors.organisasjonerSelector,
  (juridiskArbeidsgiver, organisasjoner) => {
    const { ekstraArbeidsgivere } = juridiskArbeidsgiver;
    if (!ekstraArbeidsgivere) { return []; }

    return organisasjoner.filter(organisasjon => ekstraArbeidsgivere.includes(organisasjon.orgnr));
  }
);

export const SelvstendigArbeidSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.selvstendigArbeid || {}
);

export const SelvstendigNaringsvirksomhetSelector = createSelector(
  SelvstendigArbeidSelector,
  OrganisasjonSelectors.organisasjonerSelector,
  (selvstendigArbeid, organisasjoner) => {
    const { selvstendigForetak = [] } = selvstendigArbeid;
    return organisasjoner.filter(organisasjon => selvstendigForetak.find(foretak => foretak.orgnr === organisasjon.orgnr));
  }
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

export const MedfolgendeAndreSelector = createSelector(
  PersonOpplysningerSelector,
  PersonSelectors.personerSelector,
  (personopplysninger, allePersoner) => {
    const { medfolgendeAndre } = personopplysninger;
    return allePersoner.find(person => person.fnr === medfolgendeAndre);
  }
);

export const HjemmebaseSelector = createSelector(
  ArbeidNorgeSelector,
  arbeidNorge => arbeidNorge.flyendePersonellHjemmebase
);

export const NorskeArbeidsgivereSedSelector = createSelector(
  BehandlingsgrunnlagDataSelector,
  behandlingsgrunnlagData => behandlingsgrunnlagData.norskeArbeidsgivere || []
);
