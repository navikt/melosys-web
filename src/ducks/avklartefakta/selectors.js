
/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';
import { getFormValues } from 'redux-form';

import Regler from '../../regler';
import { fagsakSelectors } from '../fagsaker/';
import { soknadSelectors } from '../soknad';

const avklartFaktaTemplate = {
  referanse: '',
  avklartefaktaKode: null,
  fakta: [],
  subjektID: '',
  begrunnelseKoder: [],
  begrunnelseFritekst: null,
};

// selector(s)
export const AvklartefaktaSelector = createSelector(
  state => (state.avklartefakta.data ? state.avklartefakta.data : []),
  avklartefakta => avklartefakta || []
);

export const Oppholdsland = createSelector(
  state => AvklartefaktaSelector(state),
  state => soknadSelectors.OppholdsLandSelector(state),
  (alleAvklartefakta, alleLandISoknaden) => (
    alleLandISoknaden.map(enkeltLand => (
      alleAvklartefakta.find(avklaring => avklaring.subjektID === enkeltLand) ||
        {
          ...avklartFaktaTemplate,
          referanse: 'OPPHOLDSLAND',
          subjektID: enkeltLand,
          fakta: ['TRUE'],
        }
    ))
  )
);

export const Sysselsetting = createSelector(
  state => AvklartefaktaSelector(state),
  alleAvklarteFakta => {
    const avklartFakta = alleAvklarteFakta.find(avklaring => avklaring.referanse === 'SYSSELSETTING');
    if (!avklartFakta) return null;
    return avklartFakta.fakta[0];
  }
);

export const YrkesaktivitetAntallLand = createSelector(
  state => AvklartefaktaSelector(state),
  alleAvklarteFakta => {
    const avklartFakta = alleAvklarteFakta.find(avklaring => avklaring.referanse === 'YRKESAKTIVITET_ANTALL_LAND');
    if (!avklartFakta) return null;
    return avklartFakta.fakta[0];
  }
);

export const Yrkesaktivitet = createSelector(
  state => AvklartefaktaSelector(state),
  alleAvklarteFakta => {
    const avklartFakta = alleAvklarteFakta.find(avklaring => avklaring.referanse === 'YRKESAKTIVITET');
    if (!avklartFakta) return null;
    return avklartFakta.fakta[0];
  }
);

/**
 * Kun arbeidsgivere med arbeidsforhold som tangerer innenfor perioden som er lagt inn i avklartefaktaen skal
 * vises i listen over valgbare arbeidsgivere i stegvelgeren (VurderingArbeidsgivere).
 */
export const ArbeidsgivereIPeriodenSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.arbeidsforhold : []),
  state => fagsakSelectors.OrganisasjonerSelector(state),
  state => getFormValues('soknad')(state),
  (arbeidsforholdene, organisasjoner, skjema) => {
    const regler = new Regler(skjema);
    const arbeidsforholdIPerioden = arbeidsforholdene
      .filter(arbeidsforholdet => (
        regler.arbeid().erArbeidsforholdetRelevantForSoknadsperioden(arbeidsforholdet.ansettelsesPeriode).status
      ));

    return organisasjoner.reduce((samling, organisasjonen) => {
      const organisasjonenHarArbeidsforholdIPerioden = arbeidsforholdIPerioden.some(forholdet => forholdet.opplysningspliktigID === organisasjonen.orgnr);
      return organisasjonenHarArbeidsforholdIPerioden ? [...samling, organisasjonen] : [...samling];
    }, []);
  }
);

export const ArbeidsgivereSelector = createSelector(
  state => AvklartefaktaSelector(state),
  state => ArbeidsgivereIPeriodenSelector(state),
  (alleAvklarteFakta, alleArbeidsgivere) => {
    const avklartefakta = alleAvklarteFakta.filter(avklaring => avklaring.referanse === 'ARBEIDSGIVERE');
    const returnObjekt = alleArbeidsgivere.map(arbeidsgiver => {
      const eksisterendeAvklaring = avklartefakta.find(fakta => fakta.subjektID === arbeidsgiver.orgnr);

      return eksisterendeAvklaring || {
        ...avklartFaktaTemplate,
        referanse: 'ARBEIDSGIVER',
        fakta: ['FALSE'],
        subjektID: arbeidsgiver.orgnr,
        avklartFaktaKode: 'ARBEIDSGIVER', // TODO: Kode ikke avklart av arkitektur.
      };
    });

    return returnObjekt;
  }
);

export const AvklartefaktaOppholdSelector = createSelector(
  state => AvklartefaktaSelector(state).opphold,
  opphold => opphold || []
);

export const AvklartefaktaGyldigeOppholdLandSelector = createSelector(
  state => AvklartefaktaOppholdSelector(state).land || [],
  opphold => opphold.filter(enkeltOpphold => enkeltOpphold.erGyldig) || []
);

export const AvklartefaktaLovvalgKodeSelector = createSelector(
  state => AvklartefaktaSelector(state).vurdering || {},
  vurdering => (vurdering.lovvalgKode ? vurdering.lovvalgKode : '')
);

export const AvklartefaktaOppholdPeriodeSelector = createSelector(
  state => AvklartefaktaOppholdSelector(state),
  oppholdet => (oppholdet.periode ? oppholdet.periode : {})
);

export const AvklartefaktaValgteArbeidsgivereSelector = createSelector(
  state => AvklartefaktaSelector(state).valgteArbeidsgivere,
  valgteArbeidsgivere => valgteArbeidsgivere || []
);

export const AvklartefaktaVurderingSelector = createSelector(
  state => AvklartefaktaSelector(state).vurdering,
  vurdering => vurdering || {}
);

