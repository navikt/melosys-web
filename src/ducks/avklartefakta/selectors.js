
/*
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from 'reselect';

import MKV from '../../melosyskodeverk';

import * as KV from '../../kodeverk';
import * as Utils from '../../utils';

import { behandlingerSelectors } from '../behandlinger';
import { behandlingsgrunnlagSelectors } from '../behandlingsgrunnlag';
import { OrganisasjonSelectors } from '../organisasjoner';
import { hentFakta, hentFaktaVerdi } from '../../regler/avklartefakta';

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

export const SoknadslandFaktaerSelector = createSelector(
  AvklartefaktaSelector,
  avklartefakta => avklartefakta.filter(enkelt => enkelt.referanse === KV.Koder.avklartefaktaKoder.SOKNADSLAND)
);

export const VurderingUnntakPeriode = createSelector(
  state => AvklartefaktaSelector(state) || [],
  alleAvklartefakta => (
    alleAvklartefakta.find(avklaring => avklaring.avklartefaktaKode === KV.Koder.avklartefaktaKoder.VURDERING_UNNTAK_PERIODE) || {}
  )
);
/* Soknadsland hentes fra selve søknaden (se soknad-duck), men avklaringen rundt hvorvidt
 * territoriet som søkeren skal til faktisk er med i forordningen gjøres i avklartefakta.
 * Derfor må både avklartefakta og soknad settes inn slik at disse kan flettes til avklart fakta.
 */
export const Soknadsland = createSelector(
  state => SoknadslandFaktaerSelector(state),
  state => behandlingsgrunnlagSelectors.SoknadslandSelector(state),
  (soknadslandFaktaer, alleLandISoknaden) => (
    alleLandISoknaden.map(enkeltLand => (
      soknadslandFaktaer.find(avklaring => avklaring.subjektID === enkeltLand) ||
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

const konverterForetakUtlandTilVirksomhet = foretakUtland => ({
  navn: foretakUtland.navn,
  virksomhetId: foretakUtland.uuid,
  adresse: {
    land: KV.kodeTilTerm(foretakUtland.adresse.landkode, MKV.KTObjects.landkoder),
  },
});

const konverterOrganisasjonTilVirksomhet = org => ({
  navn: org.navn,
  virksomhetId: org.orgnr,
  adresse: {
    land: org.forretningsadresse.land,
  },
});

/* Det er den juridiske virksomheten som skal vises i stegvelgeren. Derfor må vi traversere listen over arbeidsforhold
 * og merge inn organisasjoner slik at det er der den juridiske organisasjonens navn som vises i panelet.
 */
export const VirksomheterIPeriodenSelector = createSelector(
  state => behandlingerSelectors.ArbeidsforholdSelector(state),
  state => behandlingerSelectors.OrganisasjonerSelector(state),
  state => behandlingsgrunnlagSelectors.EkstraArbeidsgivereSelector(state),
  state => behandlingsgrunnlagSelectors.SelvstendigNaringsvirksomhetSelector(state),
  state => behandlingsgrunnlagSelectors.ForetakUtlandSelector(state),
  (
    arbeidsforholdene,
    organisasjoner,
    ekstraArbeidsgivere,
    selvstendigeNaringer,
    foretakUtland
  ) => {
    const relevanteOrganisasjoner = organisasjoner.filter(organisasjonen => {
      const organisasjonenHarArbeidsforhold = arbeidsforholdene.some(forholdet => forholdet.opplysningspliktigID === organisasjonen.orgnr);
      return organisasjonenHarArbeidsforhold;
    });

    const foretakUtlandMedNavn = foretakUtland.filter(foretak => foretak.navn);

    return [
      ...relevanteOrganisasjoner.map(konverterOrganisasjonTilVirksomhet),
      ...ekstraArbeidsgivere.map(konverterOrganisasjonTilVirksomhet),
      ...selvstendigeNaringer.map(konverterOrganisasjonTilVirksomhet),
      ...foretakUtlandMedNavn.map(konverterForetakUtlandTilVirksomhet),
    ];
  }
);

/* Det er kun virksomheter som saksbehandler har krysset av som skal være med videre som grunnlag
 * for vurderingen. Alle virksomheter som ikke er krysset av skal automatisk markeres som om de ikke er med videre
 * dvs "FALSE" som fakta.
 */
export const VirksomhetFaktaerSelector = createSelector(
  state => AvklartefaktaSelector(state),
  state => VirksomheterIPeriodenSelector(state),
  (alleAvklarteFakta, alleVirksomheter) => {
    const avklartefakta = alleAvklarteFakta.filter(avklaring => avklaring.referanse === KV.Koder.avklartefaktaKoder.VIRKSOMHET);

    return alleVirksomheter.reduce((virksomhetFaktaer, virksomhet) => {
      const eksisterendeVirksomhetFakta = avklartefakta.find(fakta => fakta.subjektID === virksomhet.virksomhetId);

      if (eksisterendeVirksomhetFakta) return [...virksomhetFaktaer, eksisterendeVirksomhetFakta];
      return virksomhetFaktaer;
    }, []);
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
  state => behandlingsgrunnlagSelectors.MaritimtArbeidSelector(state),
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

const MarginaltArbeidFaktaerSelector = createSelector(
  AvklartefaktaSelector,
  avklartefakta => avklartefakta.filter(enkelt => enkelt.referanse === KV.Koder.avklartefaktaKoder.MARGINALT_ARBEID)
);

const MarginaleArbeidslandFaktaerSelector = createSelector(
  MarginaltArbeidFaktaerSelector,
  marginaltArbeidFakta => marginaltArbeidFakta.filter(enkelt => enkelt.fakta.includes(KV.Koder.BoolskAvklartfaktaType.SANN))
);

const MarginaleArbeidslandSelector = createSelector(
  state => MarginaleArbeidslandFaktaerSelector(state) || [],
  marginaleArbeidslandFaktaer => marginaleArbeidslandFaktaer.map(fakta => fakta.subjektID)
);

export const MarginaleArbeidslandKTSelector = createSelector(
  state => MarginaleArbeidslandSelector(state) || [],
  marginaleArbeidsland => MKV.KTObjects.landkoder.filter(landkodeObjekt => marginaleArbeidsland.includes(landkodeObjekt.kode))
);

const IkkeMarginaleArbeidslandSelector = createSelector(
  state => ArbeidslandSelector(state) || [],
  state => MarginaleArbeidslandSelector(state) || [],
  (arbeidsland, marginaleArbeidsland) => arbeidsland.filter(land => !marginaleArbeidsland.includes(land))
);

export const IkkeMarginaleArbeidslandKTSelector = createSelector(
  state => IkkeMarginaleArbeidslandSelector(state) || [],
  ikkeMarginaleArbeidsland => MKV.KTObjects.landkoder.filter(landkodeObjekt => ikkeMarginaleArbeidsland.includes(landkodeObjekt.kode))
);

export const AvklartefaktaLovvalgKodeSelector = createSelector(
  state => AvklartefaktaSelector(state).vurdering || {},
  vurdering => (vurdering.lovvalgKode ? vurdering.lovvalgKode : '')
);

export const AvklarteVirksomheterSelector = createSelector(
  state => VirksomhetFaktaerSelector(state),
  state => behandlingerSelectors.OrganisasjonerSelector(state),
  state => OrganisasjonSelectors.organisasjonerSelector(state),
  state => behandlingsgrunnlagSelectors.ForetakUtlandSelector(state),
  (virksomhetFaktaer, fagsakOrganisasjoner, soknadOrganisasjoner, foretakUtland) => {
    const alleOrganisasjoner = [...fagsakOrganisasjoner, ...soknadOrganisasjoner];
    const alleAvklarteVirksomheter = virksomhetFaktaer.filter(virksomhet => virksomhet.fakta.includes('TRUE'));

    return alleAvklarteVirksomheter.map(virksomhet => {
      const avklartForetak = foretakUtland.find(foretak => foretak.uuid === virksomhet.subjektID);
      if (avklartForetak) return konverterForetakUtlandTilVirksomhet(avklartForetak);

      const avklartOrganisasjon = alleOrganisasjoner.find(org => org.orgnr === virksomhet.subjektID);
      if (avklartOrganisasjon) return konverterOrganisasjonTilVirksomhet(avklartOrganisasjon);

      throw new Error('Avklart virksomhet må enten tilhøre et utenlandsk foretak eller en organisasjon');
    });
  }
);

export const EnVirksomhetErAvklartSelector = createSelector(
  AvklarteVirksomheterSelector,
  avklarteVirksomheter => avklarteVirksomheter.length === 1
);

export const AvklartefaktaVurderingSelector = createSelector(
  state => AvklartefaktaSelector(state).vurdering,
  vurdering => vurdering || {}
);

export const BostedslandSelector = createSelector(
  state => AvklartefaktaSelector(state),
  alleAvklarteFakta => {
    const avklartFakta = alleAvklarteFakta.find(avklaring => avklaring.referanse === KV.Koder.avklartefaktaKoder.BOSTEDSLAND);
    if (!avklartFakta) return null;
    const bostedslandkode = hentFaktaVerdi(avklartFakta);
    return MKV.KTObjects.landkoder.find(enkeltLand => enkeltLand.kode === bostedslandkode);
  }
);

export const ErIArtikkel13_1FlytSelector = createSelector(
  AvklartefaktaSelector,
  avklarteFakta => (
    avklarteFakta.some(avklartFakta => avklartFakta.fakta.includes(KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND))
  )
);

export const ErIDirekteTilArtikkel16FlytSelector = createSelector(
  AvklartefaktaSelector,
  avklarteFakta => (
    avklarteFakta.some(avklartFakta => {
      if (!avklartFakta.fakta) return false;
      return avklartFakta.fakta.includes(KV.Koder.VurderingYrkesgruppeTyper.ORDINAER_UTEN_ART12);
    })
  )
);

export const OmfattesILandFaktaSelector = createSelector(
  AvklartefaktaSelector,
  avklarteFakta => (
    avklarteFakta.find(avklaring => avklaring.referanse === KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND)
  )
);

export const OmfattesILandSelector = createSelector(
  OmfattesILandFaktaSelector,
  omfattesILandFakta => hentFaktaVerdi(omfattesILandFakta)
);

export const OmfattesINorgeSelector = createSelector(
  OmfattesILandSelector,
  OmfattesILandFaktaSelector,
  (omfattesILand, omfattesILandFakta) => Utils._isObject(omfattesILandFakta) && omfattesILand === MKV.Koder.landkoder.NO
);

export const OmfattesIAnnetLandSelector = createSelector(
  OmfattesILandSelector,
  OmfattesILandFaktaSelector,
  (omfattesILand, omfattesILandFakta) => Utils._isObject(omfattesILandFakta) && omfattesILand !== MKV.Koder.landkoder.NO
);

const UtpekingGodkjentFaktaSelector = createSelector(
  AvklartefaktaSelector,
  avklarteFakta => hentFakta(KV.Koder.avklartefaktaKoder.UTPEKING_GODKJENT, avklarteFakta)
);

export const UtpekingAvvistSelector = createSelector(
  UtpekingGodkjentFaktaSelector,
  utpekingGodkjentFakta => hentFaktaVerdi(utpekingGodkjentFakta) === KV.Koder.UtpekingAvNorgeGodkjenning.IKKE_GODKJENN
);
