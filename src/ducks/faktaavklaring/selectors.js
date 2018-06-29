
/**
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import moment from 'moment';

import { createSelector } from 'reselect';
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

export const FaktaavklaringValgteArbeidsforholdSelector = createSelector(
  state => FaktaavklaringSelector(state).valgteArbeidsforhold,
  valgteArbeidsforhold => valgteArbeidsforhold || []
);

export const FaktaavklaringVesentligVirksomhetSelector = createSelector(
  state => FaktaavklaringSelector(state).vesentligVirksomhet || {},
  vesentligVirksomhet => vesentligVirksomhet || {}
);

export const FaktaavklaringValgteArbeidsforholdDetaljerSelector = createSelector(
  state => FaktaavklaringValgteArbeidsforholdSelector(state) || [],
  state => fagsakSelectors.ArbeidsforholdeneSelector(state) || [],
  (valgteArbeidsforholdIDnav, alleArbeidsforhold) => {
    if (!valgteArbeidsforholdIDnav) return [];
    const valgteArbeidsforhold = alleArbeidsforhold.filter(arbeidsforholdet => valgteArbeidsforholdIDnav.includes(arbeidsforholdet.arbeidsforholdIDnav));
    return (valgteArbeidsforhold || []);
  }
);

/**
 * Kun arbeidsforhold som tangerer innenfor perioden som er lagt inn i faktaavklaringen skal
 * vises i listen over valgbare arbeidsforhold i stegvelgeren (vurderingArbeidsforhold).
 */
export const RelevanteArbeidsforholdeneSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.arbeidsforhold : []),
  state => fagsakSelectors.OrganisasjonerSelector(state),
  state => FaktaavklaringOppholdPeriodeSelector(state),
  (arbeidsforholdene = [], organisasjoner = [], opphold = {}) => (
    arbeidsforholdene
      .map(forholdet => {
        const forholdetsArbeidsgiver = organisasjoner.find(org => org.orgnr === forholdet.arbeidsgiverID) || {};
        return ({ ...forholdet, arbeidsgiver: forholdetsArbeidsgiver });
      })
      .filter(arbeidsforholdet => {
        // Til-og-med-periode for et arbeidsforhold kan være undefined og dermed et fortsatt
        // løpende arbeidsforhold. For at arbeidsforholdet dermed skal komme med i listen,
        // sett dagens moment() slik at diff blir riktig.
        const { fom: ansattStartDato = moment(), tom: ansattSluttDato = moment() } = arbeidsforholdet.ansettelsesPeriode;
        const { fom: oppholdStartDato, tom: oppholdSluttDato } = opphold;

        const erAnsattVedPeriodeStart = moment(oppholdStartDato, 'YYYY-MM-DD').diff(moment(ansattSluttDato, 'YYYY-MM-DD')) <= 0;
        const erAnsattVedPeriodeSlutt = moment(oppholdSluttDato, 'YYYY-MM-DD').diff(moment(ansattStartDato, 'YYYY-MM-DD')) >= 0;
        return erAnsattVedPeriodeStart && erAnsattVedPeriodeSlutt;
      })
  )
);

export const FaktaavklaringForretningsstedSelector = createSelector(
  state => FaktaavklaringSelector(state).forretningssted,
  forretningssted => forretningssted || {}
);

