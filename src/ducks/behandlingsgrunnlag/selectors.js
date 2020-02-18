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

export const ArbeidNorgeSelector = createSelector(
  BehandlingsgrunnlagSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.arbeidnorge || {}
);

export const ArbeidUtlandSelector = createSelector(
  BehandlingsgrunnlagSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.arbeidUtland || []
);

export const ArbeidsinntektSelector = createSelector(
  BehandlingsgrunnlagSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.arbeidsinntekt || {}
);

export const ArbeidsinntektNaturalytelserSelector = createSelector(
  ArbeidsinntektSelector,
  arbeidsinntekt => arbeidsinntekt.inntektNaturalytelser || {}
);

export const ForetakUtlandSelector = createSelector(
  BehandlingsgrunnlagSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.foretakUtland || []
);

export const JuridiskArbeidsgiverNorgeSelector = createSelector(
  BehandlingsgrunnlagSelector,
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
  BehandlingsgrunnlagSelector,
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
  BehandlingsgrunnlagSelector,
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
  BehandlingsgrunnlagSelector,
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
  BehandlingsgrunnlagSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.arbeidsgiversBekreftelse || {}
);

export const MaritimtArbeidSelector = createSelector(
  BehandlingsgrunnlagSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.maritimtArbeid || []
);

export const SoknadslandSelector = createSelector(
  BehandlingsgrunnlagSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.soeknadsland.landkoder || []
);

export const PeriodeSelector = createSelector(
  BehandlingsgrunnlagSelector,
  behandlingsgrunnlag => behandlingsgrunnlag.periode || {}
);

export const PersonOpplysningerSelector = createSelector(
  BehandlingsgrunnlagSelector,
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
