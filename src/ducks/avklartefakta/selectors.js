
/*
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../kodeverk';

import { fagsakSelectors } from '../fagsaker/';
import { soknadSelectors } from '../soknad';
import { vilkarSelectors } from '../vilkar';
import { OrganisasjonSelectors } from '../organisasjoner';

/* Dersom en avklartfakta må bygges opp, benyttes denne malen. Det er dette objektet som utgjør
 * hele enkeltvise avklartfakta og som sendes til backend.
 */
const avklartFaktaTemplate = {
  referanse: '',
  avklartefaktaKode: null,
  fakta: [],
  subjektID: '',
  begrunnelseKoder: [],
  begrunnelseFritekst: null,
};

/* Hovedselector for alle avklarte fakta. */
export const AvklartefaktaSelector = createSelector(
  state => (state.avklartefakta.data ? state.avklartefakta.data : []),
  avklartefakta => avklartefakta || []
);

/* Soknadsland hentes fra selve søknaden (se soknad-duck), men avklaringen rundt hvorvidt
 * territoriet som søkeren skal til faktisk er med i forordningen gjøres i avklartefakta.
 * Derfor må både avklartefakta og soknad settes inn slik at disse kan flettes til avklart fakta.
 */
export const Soknadsland = createSelector(
  state => AvklartefaktaSelector(state),
  state => soknadSelectors.SoknadslandSelector(state),
  (alleAvklartefakta, alleLandISoknaden) => (
    alleLandISoknaden.map(enkeltLand => (
      alleAvklartefakta.find(avklaring => avklaring.subjektID === enkeltLand) ||
      {
        ...avklartFaktaTemplate,
        referanse: KV.Koder.avklartefaktaKoder.SOKNADSLAND,
        subjektID: enkeltLand,
        fakta: ['TRUE'],
      }
    ))
  )
);

/* Avklart fakta om søker er yrkesaktiv, ytelsesmottaker etc. */
export const Yrkesgruppe = createSelector(
  state => AvklartefaktaSelector(state),
  alleAvklarteFakta => {
    const avklartFakta = alleAvklarteFakta.find(avklaring => avklaring.referanse === KV.Koder.avklartefaktaKoder.YRKESGRUPPE);
    if (!avklartFakta) return null;
    return avklartFakta.fakta[0];
  }
);

/* Avklart fakta om søkers yrkesaktivitet og antall land. */
export const YrkesaktivitetAntallLand = createSelector(
  state => AvklartefaktaSelector(state),
  alleAvklarteFakta => {
    const avklartFakta = alleAvklarteFakta.find(avklaring => avklaring.referanse === KV.Koder.avklartefaktaKoder.YRKESAKTIVITET_ANTALL_LAND);
    if (!avklartFakta) return null;
    return avklartFakta.fakta[0];
  }
);

/* Avklart fakta om søker er ordinær arbeidstaker, selvstendig næringsdrivende, begge deler eller tjenesteperson. */
export const Yrkesaktivitet = createSelector(
  state => AvklartefaktaSelector(state),
  alleAvklarteFakta => {
    const avklartFakta = alleAvklarteFakta.find(avklaring => avklaring.referanse === KV.Koder.avklartefaktaKoder.YRKESAKTIVITET);
    if (!avklartFakta) return null;
    return avklartFakta.fakta[0];
  }
);

/* Det er den juridiske virksomheten som skal vises i stegvelgeren. Derfor må vi traversere listen over arbeidsforhold
 * og merge inn organisasjoner slik at det er der den juridiske organisasjonens navn som vises i panelet.
 */
export const VirksomheterIPeriodenSelector = createSelector(
  state => (state.fagsaker.data.behandlinger ? state.fagsaker.data.behandlinger[0].saksopplysninger.arbeidsforhold : []),
  state => fagsakSelectors.OrganisasjonerSelector(state),
  state => soknadSelectors.EkstraArbeidsgivereSelector(state),
  state => soknadSelectors.SelvstendigNaringsvirksomhetSelector(state),
  (arbeidsforholdene, organisasjoner, ekstraArbeidsgivere, selvstendigeNaringer) => {
    const relevanteOrganisasjoner = organisasjoner.reduce((samling, organisasjonen) => {
      const organisasjonenHarArbeidsforhold = arbeidsforholdene.some(forholdet => forholdet.opplysningspliktigID === organisasjonen.orgnr);
      return organisasjonenHarArbeidsforhold ? [...samling, organisasjonen] : [...samling];
    }, []);

    return [...relevanteOrganisasjoner, ...ekstraArbeidsgivere, ...selvstendigeNaringer];
  }
);

/* Det er kun virksomheter som saksbehandler har krysset av som skal være med videre som grunnlag
 * for vurderingen. Alle virksomheter som ikke er krysset av skal automatisk markeres som om de ikke er med videre
 * dvs "FALSE" som fakta.
 */
export const VirksomhetSelector = createSelector(
  state => AvklartefaktaSelector(state),
  state => VirksomheterIPeriodenSelector(state),
  (alleAvklarteFakta, alleArbeidsgivere) => {
    const avklartefakta = alleAvklarteFakta.filter(avklaring => avklaring.referanse === KV.Koder.avklartefaktaKoder.VIRKSOMHET);
    return alleArbeidsgivere.map(arbeidsgiver => {
      const eksisterendeAvklaring = avklartefakta.find(fakta => fakta.subjektID === arbeidsgiver.orgnr);

      return eksisterendeAvklaring || {
        ...avklartFaktaTemplate,
        referanse: KV.Koder.avklartefaktaKoder.VIRKSOMHET,
        fakta: ['FALSE'],
        subjektID: arbeidsgiver.orgnr,
        avklartefaktaKode: KV.Koder.avklartefaktaKoder.VIRKSOMHET,
      };
    });
  }
);

export const ArbeidSokkelSkipSelector = createSelector(
  state => AvklartefaktaSelector(state),
  alleAvklarteFakta => {
    const avklartFakta = alleAvklarteFakta.find(avklaring => avklaring.referanse === KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP);
    if (!avklartFakta) return null;
    return avklartFakta.fakta[0];
  }
);

/* Avklartfakta for hvorvidt en installasjon er SOKKEL eller SKIP.
 * Selectoren henter avklaringer fra redux state og omformer de til array<object> som
 * Redux Form kan lese.
 */
export const SokkelEllerSkipSelector = createSelector(
  state => AvklartefaktaSelector(state),
  state => soknadSelectors.MaritimtArbeidSelector(state),
  (alleAvklarteFakta, alleMaritimeArbeid) => {
    // Selectoren lager 2 lister - en for avklart fakta for arbeidsland for hvert sokkel / skip
    // og én for avklartfakta om installasjonen er sokkel eller skip.

    const arbeidsland = alleAvklarteFakta
      .filter(avklaring => avklaring.referanse === KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND)
      .map(avklaring => avklaring.fakta[0]);

    const sokkelEllerSkip = alleAvklarteFakta
      .filter(avklaring => avklaring.referanse === KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP)
      .map((avklaring, index) => ({
        installasjonsType: avklaring.fakta[0],
        arbeidsland: arbeidsland[index],
        installasjonsTypeBegrunnelse: avklaring.begrunnelseKoder && avklaring.begrunnelseKoder[0],
      }));

    // Dersom søknaden inneholder x antall maritime arbeid, men som ikke er avklart i
    // stegvelgeren vil avklartfakta fortsatt være tom. Derfor trenger vi å
    // fylle inn arrayen slik at valideringen kan iterere på alle maritime arbeid som
    // det forventes at saksbehandler skal gjøre en avklaring på.
    let antallSomMangler = alleMaritimeArbeid.length - sokkelEllerSkip.length;
    if (antallSomMangler < 0) antallSomMangler = 0;
    const arrayFyll = new Array(antallSomMangler).fill({});
    return [...sokkelEllerSkip, ...arrayFyll];
  }
);

/** Forretningsregel: Dersom søker arbeider på skip, så er arbeidslandet det samme som skipets flaggland.
 * Derfor må denne selectoren ta hensyn til avklart fakta for sokkel/skip og overstyre landet som er oppgitt i søknaden.
 *
 */

const SoknadslandSelector = createSelector(
  state => Soknadsland(state) || [],
  avklartefaktaLandListe => (avklartefaktaLandListe
    .filter(avklartfakta => avklartfakta.fakta.includes('TRUE'))
    .map(avklartfakta => avklartfakta.subjektID))
);

const MaritimeArbeidslandSelector = createSelector(
  state => SokkelEllerSkipSelector(state),
  sokkelEllerSkipListe => (sokkelEllerSkipListe
    .map(sokkelEllerSkip => sokkelEllerSkip.arbeidsland)
    .filter(arbeidsland => arbeidsland))
);

const ArbeidslandSelector = createSelector(
  state => SoknadslandSelector(state),
  state => MaritimeArbeidslandSelector(state),
  (soknadsland, maritimeArbeidsland) => {
    if (maritimeArbeidsland.length > 0) return maritimeArbeidsland;
    return soknadsland;
  }
);

export const ArbeidslandKTSelector = createSelector(
  state => ArbeidslandSelector(state),
  arbeidsland => MKV.KTObjects.landkoder.filter(landkodeObjekt => arbeidsland.includes(landkodeObjekt.kode))
);

export const AvklartefaktaLovvalgKodeSelector = createSelector(
  state => AvklartefaktaSelector(state).vurdering || {},
  vurdering => (vurdering.lovvalgKode ? vurdering.lovvalgKode : '')
);

export const AvklarteVirksomheterSelector = createSelector(
  state => VirksomhetSelector(state),
  state => fagsakSelectors.OrganisasjonerSelector(state),
  state => OrganisasjonSelectors.organisasjonerSelector(state),
  (alleArbeidsgivere, fagsakOrganisasjoner, soknadOrganisasjoner) => {
    const alleOrganisasjoner = [...fagsakOrganisasjoner, ...soknadOrganisasjoner];
    const avklarte = alleArbeidsgivere.filter(avklart => avklart.fakta.includes('TRUE'));
    return avklarte.map(avklart => alleOrganisasjoner.find(org => org.orgnr === avklart.subjektID));
  }
);

export const AvklartefaktaVurderingSelector = createSelector(
  state => AvklartefaktaSelector(state).vurdering,
  vurdering => vurdering || {}
);

export const BostedslandSelector = createSelector(
  state => vilkarSelectors.bosattINorge(state),
  state => AvklartefaktaSelector(state),
  (bosattINorge, alleAvklarteFakta) => {
    let bostedslandkode;
    if (bosattINorge.oppfylt) {
      bostedslandkode = MKV.Koder.landkoder.NO;
    } else {
      const avklartFakta = alleAvklarteFakta.find(avklaring => avklaring.referanse === KV.Koder.avklartefaktaKoder.BOSTEDSLAND);
      if (!avklartFakta) return null;
      [bostedslandkode] = avklartFakta.fakta;
    }
    return MKV.KTObjects.landkoder.find(enkeltLand => enkeltLand.kode === bostedslandkode);
  }
);
