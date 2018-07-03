
/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

import Regler from '../../regler';
import { fagsakSelectors } from '../fagsaker/';
import { datoDiff } from '../../utils/dato';

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

export const FaktaavklaringBostedSnarveiSelector = createSelector(
  state => FaktaavklaringBostedSelector(state).land || [],
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
  state => FaktaavklaringOppholdPeriodeSelector(state),
  (arbeidsforholdene, organisasjoner, soknadsPeriode) => {
    const arbeidsforholdIPerioden = arbeidsforholdene
      .filter(arbeidsforholdet => (
        erArbeidsforholdetRelevantForSoknadsperioden(arbeidsforholdet.ansettelsesPeriode, soknadsPeriode)
      ));

    // Reduser organisasjoner som har arbeidsforhold i perioden.
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


const erArbeidsforholdetRelevantForSoknadsperioden = (ansettelsesPeriode, soknadsPeriode) => {
  const { fom: ansattStartDato, tom: ansattSluttDato } = ansettelsesPeriode;
  const { fom: oppholdStartDato, tom: oppholdSluttDato } = soknadsPeriode;

  if (!ansattStartDato) { return false; } // Dersom vi ikke vet startdatoen for arbeidsforholdet er det noe muffins.

  const erAnsattVedPeriodeStart = datoDiff(ansattStartDato, oppholdStartDato, 'days') >= 0;
  const erAnsattVedPeriodeSlutt = datoDiff(ansattSluttDato, oppholdSluttDato, 'days') <= 0;

  console.log(erAnsattVedPeriodeStart, erAnsattVedPeriodeSlutt);

  return erAnsattVedPeriodeStart && erAnsattVedPeriodeSlutt;
};
