import { createSelector } from 'reselect';
import * as Api from '../services/api';
import { STATUS, doThenDispatch } from '../services/utils';

import { fagsakSelectors } from './fagsaker/';

import { formatterDatoTilISO } from '../utils/dato';

const moment = require('moment');

// Actions
const OK = 'faktaavklaring/OK';
const FEILET = 'faktaavklaring/FEILET';
const PENDING = 'faktaavklaring/PENDING';
const OPPDATER_FAKTAAVKLARING = 'faktaavklaring/OPPDATER_FAKTAAVKLARING';

const initialState = {
  data: {},
  status: STATUS.NOT_STARTED,
};

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PENDING:
      return { ...state, status: STATUS.PENDING };
    case FEILET:
      return { ...state, status: STATUS.ERROR, data: action.data };
    case OK:
      return {
        ...state,
        status: STATUS.OK,
        data: action.data,
      };
    case OPPDATER_FAKTAAVKLARING: {
      const { dokument } = action;
      const faktaavklaring = {
        ...state.data.faktaavklaring,
        opphold: {
          land: dokument.faktaavklaringOppholdsLand,
          periode: {
            fom: formatterDatoTilISO(dokument.faktaavklaringPeriodeFraOgMed),
            tom: formatterDatoTilISO(dokument.faktaavklaringPeriodeTilOgMed),
          },
        },
        sysselsetting: {
          sysselsettingType: dokument.faktaavklaringSysselsettingType,
        },
        aktivitet: {
          aktivitetLand: dokument.faktaavklaringAktivitetLand,
        },
        utsending: {
          ansattINorskSelskap: dokument.faktaavklaringAnsattINorskSelskap,
          erstatterTidligereUtsendt: dokument.faktaavklaringErstatterTidligereUtsendt,
          utsendingMindreEnn24Mnd: dokument.faktaavklaringUtsendingMindreEnn24Mnd,
          foretakDriverINorge: dokument.faktaavklaringForetakDriverINorge,
          harForutgaendeMedlemskap: dokument.faktaavklaringHarForutgaendeMedlemskap,
          arbeidKnyttetTilVirksomhetUtlandet: dokument.faktaavklaringArbeidKnyttetTilVirksomhetUtlandet,
          sammeTypeVirksomhet: dokument.faktaavklaringSammeTypeVirksomhet,
        },
        valgteArbeidsforhold: [...dokument.faktaavklaringValgteArbeidsforhold],
        sektor: {
          ansattISektor: dokument.faktaavklaringAnsattISektor,
        },
        bostedsland: {
          bekrefterFamiliebosted: dokument.faktaavklaringBekrefterFamiliebosted,
          bekrefterDisponering: dokument.faktaavklaringBekrefterDisponering,
          bostedsland: dokument.faktaavklaringBostedsland,
        },
        yrkesaktivitetFordeling: {
          antallLand: dokument.faktaavklaringAntallLand,
        },
        virksomhet: {
          aktivitetINorge: dokument.faktaavklaringAktivitetINorge,
          marginaltArbeid: dokument.faktaavklaringMarginaltArbeid,
          vekslingMellomLand: dokument.faktaavklaringVekslingMellomLand,
        },
        tjenestemann: {
          tjenestemann: dokument.faktaavklaringTjenestemann,
        },
        forretningssted: {
          land: dokument.faktaavklaringForretningsstedLand,
          antallArbeidsgivere: dokument.faktaavklaringForretningsstedAntallArbeidsgivere,
          fordelingArbeidsgivere: dokument.faktaavklaringForretningsstedFordelingArbeidsgivere,
        },
      };

      return { ...state, data: { ...state.data, faktaavklaring } };
    }
    default:
      return state;
  }
}

// Action Creators
export function hentFaktaavklaring(behandlingID) {
  return doThenDispatch(() => Api.hentFaktaavklaring(behandlingID), {
    OK,
    FEILET,
    PENDING,
  });
}

export function sendFaktaavklaring(bid, dokument) {
  return doThenDispatch(() => Api.sendFaktaavklaring(bid, dokument), {
    OK,
    FEILET,
    PENDING,
  });
}

export function oppdaterFaktaavklaringState(dokument) {
  return ({
    type: OPPDATER_FAKTAAVKLARING,
    dokument,
  });
}

// selector(s)
export const FaktaavklaringSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data : {}),
  faktaavklaring => faktaavklaring || {}
);

export const FaktaavklaringOppholdSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.opphold : {}),
  opphold => opphold || {}
);

export const FaktaavklaringOppholdPeriodeSelector = createSelector(
  state => FaktaavklaringOppholdSelector(state),
  oppholdet => (oppholdet.periode ? oppholdet.periode : {})
);

export const FaktaavklaringSysselsettingSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.sysselsetting : {}),
  sysselsetting => sysselsetting || {}
);

export const FaktaavklaringUtsendingSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.utsending : {}),
  utsending => utsending || {}
);

export const FaktaavklaringSektorSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.sektor : {}),
  sektor => sektor || {}
);

export const FaktaavklaringYrkesaktivitetFordelingSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.yrkesaktivitetFordeling : {}),
  yrkesaktivitetFordeling => yrkesaktivitetFordeling || {}
);

export const FaktaavklaringVirksomhetSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.virksomhet : {}),
  virksomhet => virksomhet || {}
);

export const FaktaavklaringBostedslandSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.bostedsland : {}),
  bostedsland => bostedsland || {}
);

export const FaktaavklaringTjenestemannSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.tjenestemann : {}),
  tjenestemann => tjenestemann || {}
);

export const FaktaavklaringAktivitetSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.aktivitet : {}),
  aktivitet => aktivitet || {}
);

export const FaktaavklaringValgteArbeidsforholdSelector = createSelector(
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.valgteArbeidsforhold : []),
  valgteArbeidsforhold => valgteArbeidsforhold || []
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
  state => (state.faktaavklaring.data.faktaavklaring ? state.faktaavklaring.data.faktaavklaring.forretningssted : {}),
  forretningssted => forretningssted || {}
);
