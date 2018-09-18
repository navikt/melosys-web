
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
export const FaktaavklaringSelector = createSelector(
  state => (state.faktaavklaring.data.avklaring ? state.faktaavklaring.data.avklaring : {}),
  faktaavklaring => faktaavklaring || {}
);

export const FaktaavklaringOppholdSelector = createSelector(
  state => FaktaavklaringSelector(state).opphold,
  opphold => opphold || {}
);

export const FaktaavklaringOppholdPeriodeSelector = createSelector(
  state => FaktaavklaringOppholdSelector(state),
  oppholdet => (oppholdet.periode ? oppholdet.periode : {})
);

export const FaktaavklaringSysselsettingSelector = createSelector(
  state => FaktaavklaringSelector(state).sysselsetting,
  sysselsetting => sysselsetting || {}
);

export const FaktaavklaringIkkeYrkesaktivSelector = createSelector(
  state => FaktaavklaringSelector(state).ikkeYrkesaktiv,
  ikkeYrkesaktiv => ikkeYrkesaktiv || {}
);

export const FaktaavklaringUtsendingSelector = createSelector(
  state => FaktaavklaringSelector(state).utsending,
  utsending => utsending || {}
);

export const FaktaavklaringForutgaendeMedlemskapSelector = createSelector(
  state => FaktaavklaringSelector(state).forutgaendeMedlemskap,
  forutgaendeMedlemskap => forutgaendeMedlemskap || {}
);

export const FaktaavklaringSektorSelector = createSelector(
  state => FaktaavklaringSelector(state).sektor,
  sektor => sektor || {}
);

export const FaktaavklaringYrkesaktivitetFordelingSelector = createSelector(
  state => FaktaavklaringSelector(state).yrkesaktivitetFordeling,
  yrkesaktivitetFordeling => yrkesaktivitetFordeling || {}
);

export const FaktaavklaringVirksomhetSelector = createSelector(
  state => FaktaavklaringSelector(state).virksomhet,
  virksomhet => virksomhet || {}
);

export const FaktaavklaringBostedSelector = createSelector(
  state => FaktaavklaringSelector(state).bosted,
  bosted => bosted || {}
);

export const FaktaavklaringBostedNorgeUtlandSelector = createSelector(
  state => FaktaavklaringBostedSelector(state).bostedLand || [],
  land => {
    if (land.length === 0) { return ''; }

    if (land.includes('NO')) {
      return 'NORGE';
    }

    return 'ANNET';
  }
);

export const FaktaavklaringTjenestemannSelector = createSelector(
  state => FaktaavklaringSelector(state).tjenestemann,
  tjenestemann => tjenestemann || {}
);

export const FaktaavklaringAktivitetSelector = createSelector(
  state => FaktaavklaringSelector(state).aktivitet,
  aktivitet => aktivitet || {}
);

export const FaktaavklaringValgteArbeidsgivereSelector = createSelector(
  state => FaktaavklaringSelector(state).valgteArbeidsgivere,
  valgteArbeidsgivere => valgteArbeidsgivere || []
);

export const FaktaavklaringVesentligVirksomhetSelector = createSelector(
  state => FaktaavklaringSelector(state).vesentligVirksomhet || {},
  vesentligVirksomhet => vesentligVirksomhet || {}
);

export const FaktaavklaringValgteArbeidsgivereDetaljerSelector = createSelector(
  state => FaktaavklaringValgteArbeidsgivereSelector(state) || [],
  state => fagsakSelectors.OrganisasjonerSelector(state) || [],
  (valgteArbeidsgivere, alleOrganisasjoner) => (
    alleOrganisasjoner.filter(organisasjonen => valgteArbeidsgivere.includes(organisasjonen.orgnr))
  )
);

/**
 * Kun arbeidsgivere med arbeidsforhold som tangerer innenfor perioden som er lagt inn i faktaavklaringen skal
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
        regler.arbeid().erArbeidsforholdetRelevantForSoknadsperioden(arbeidsforholdet.ansettelsesPeriode)
      ));

    return organisasjoner.reduce((samling, organisasjonen) => {
      const organisasjonenHarArbeidsforholdIPerioden = arbeidsforholdIPerioden.some(forholdet => forholdet.opplysningspliktigID === organisasjonen.orgnr);
      return organisasjonenHarArbeidsforholdIPerioden ? [...samling, organisasjonen] : [...samling];
    }, []);
  }
);

export const FaktaavklaringForretningsstedSelector = createSelector(
  state => FaktaavklaringSelector(state).forretningssted,
  forretningssted => forretningssted || {}
);
