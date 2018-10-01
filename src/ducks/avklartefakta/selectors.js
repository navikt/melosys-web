
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

// selector(s)
export const AvklartefaktaSelector = createSelector(
  state => (state.avklartefakta.data.avklaring ? state.avklartefakta.data.avklaring : {}),
  avklartefakta => avklartefakta || {}
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
  vurdering => (vurdering ? vurdering.lovvalgKode : '')
);

export const AvklartefaktaOppholdPeriodeSelector = createSelector(
  state => AvklartefaktaOppholdSelector(state),
  oppholdet => (oppholdet.periode ? oppholdet.periode : {})
);

export const AvklartefaktaSysselsettingSelector = createSelector(
  state => AvklartefaktaSelector(state).sysselsetting,
  sysselsetting => sysselsetting || {}
);

export const AvklartefaktaIkkeYrkesaktivSelector = createSelector(
  state => AvklartefaktaSelector(state).ikkeYrkesaktiv,
  ikkeYrkesaktiv => ikkeYrkesaktiv || {}
);

export const AvklartefaktaUtsendingSelector = createSelector(
  state => AvklartefaktaSelector(state).utsending,
  utsending => utsending || {}
);

export const AvklartefaktaForutgaendeMedlemskapSelector = createSelector(
  state => AvklartefaktaSelector(state).forutgaendeMedlemskap,
  forutgaendeMedlemskap => forutgaendeMedlemskap || {}
);

export const AvklartefaktaYrkesaktivitetSelector = createSelector(
  state => AvklartefaktaSelector(state).yrkesaktivitet,
  yrkesaktivitet => yrkesaktivitet || {}
);

export const AvklartefaktaYrkesaktivitetFordelingSelector = createSelector(
  state => AvklartefaktaSelector(state).yrkesaktivitetFordeling,
  yrkesaktivitetFordeling => yrkesaktivitetFordeling || {}
);

export const AvklartefaktaVirksomhetSelector = createSelector(
  state => AvklartefaktaSelector(state).virksomhet,
  virksomhet => virksomhet || {}
);

export const AvklartefaktaBostedSelector = createSelector(
  state => AvklartefaktaSelector(state).bosted,
  bosted => bosted || {}
);

export const AvklartefaktaBostedNorgeUtlandSelector = createSelector(
  state => AvklartefaktaBostedSelector(state).bostedLand || [],
  land => {
    if (land.length === 0) { return ''; }

    if (land.includes('NO')) {
      return 'NORGE';
    }

    return 'ANNET';
  }
);

export const AvklartefaktaTjenestemannSelector = createSelector(
  state => AvklartefaktaSelector(state).tjenestemann,
  tjenestemann => tjenestemann || {}
);

export const AvklartefaktaAktivitetSelector = createSelector(
  state => AvklartefaktaSelector(state).aktivitet,
  aktivitet => aktivitet || {}
);

export const AvklartefaktaValgteArbeidsgivereSelector = createSelector(
  state => AvklartefaktaSelector(state).valgteArbeidsgivere,
  valgteArbeidsgivere => valgteArbeidsgivere || []
);

export const AvklartefaktaVesentligVirksomhetSelector = createSelector(
  state => AvklartefaktaSelector(state).vesentligVirksomhet || {},
  vesentligVirksomhet => vesentligVirksomhet || {}
);

export const AvklartefaktaVurderingSelector = createSelector(
  state => AvklartefaktaSelector(state).vurdering,
  vurdering => vurdering || {}
);

export const AvklartefaktaValgteArbeidsgivereDetaljerSelector = createSelector(
  state => AvklartefaktaValgteArbeidsgivereSelector(state) || [],
  state => fagsakSelectors.OrganisasjonerSelector(state) || [],
  (valgteArbeidsgivere, alleOrganisasjoner) => (
    alleOrganisasjoner.filter(organisasjonen => valgteArbeidsgivere.includes(organisasjonen.orgnr))
  )
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

export const AvklartefaktaForretningsstedSelector = createSelector(
  state => AvklartefaktaSelector(state).forretningssted,
  forretningssted => forretningssted || {}
);
