/*
 * Selectors
 * -----------------------------------------------------------------------------------------
 * Målet med selectorer er å samle funksjonalitet som behandler, itererer og omformer
 * data slik at denne logikken kan benyttes flere steder i applikasjonen - ikke bare ett sted.
 */

import { createSelector } from "reselect";

import MKV from "../../melosyskodeverk";

import * as KV from "../../kodeverk";
import * as Utils from "../../utils";

import { behandlingerSelectors } from "../behandlinger";
import { mottatteOpplysningerSelectors } from "../mottatteOpplysninger";
import { OrganisasjonSelectors } from "../organisasjoner";
import { utpekingsperioderSelectors } from "../utpekingsperioder";

import { hentFaktaVerdi } from "../../domeneUtils";
import { BOOLSK_STRING } from "../../constants";

/* Dersom en avklartfakta må bygges opp, benyttes denne malen. Det er dette objektet som utgjør
 * hele enkeltvise avklartfakta og som sendes til backend.
 */
const avklartFaktaTemplate = {
  referanse: "",
  avklartefaktaKode: null,
  fakta: [],
  subjektID: "",
  begrunnelseKoder: [],
  begrunnelseFritekst: null,
};

/* Hovedselector for alle avklarte fakta. */
export const AvklartefaktaSelector = createSelector(
  (state) => (state.avklartefakta.data ? state.avklartefakta.data : []),
  (avklartefakta) => avklartefakta || []
);

export const SoknadslandFaktaerSelector = createSelector(AvklartefaktaSelector, (avklartefakta) =>
  avklartefakta.filter((enkelt) => enkelt.referanse === KV.Koder.avklartefaktaKoder.SOKNADSLAND)
);

export const IkkeArbeidslandSoknadslandFaktaerSelector = createSelector(
  SoknadslandFaktaerSelector,
  (soknadslandFaktaer) =>
    soknadslandFaktaer.filter((fakta) => hentFaktaVerdi(fakta) === KV.Koder.SoknadslandFaktaTyper.IKKE_ARBEIDSLAND)
);

export const IkkeArbeidslandSoknadslandSelector = createSelector(IkkeArbeidslandSoknadslandFaktaerSelector, (faktaer) =>
  faktaer.map((fakta) => fakta.subjektID)
);

/* Soknadsland hentes fra selve søknaden (se soknad-duck), men avklaringen rundt hvorvidt
 * territoriet som søkeren skal til faktisk er med i forordningen gjøres i avklartefakta.
 * Derfor må både avklartefakta og soknad settes inn slik at disse kan flettes til avklart fakta.
 */
export const Soknadsland = createSelector(
  (state) => SoknadslandFaktaerSelector(state),
  (state) => mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
  (soknadslandFaktaer, alleLandISoknaden) =>
    alleLandISoknaden.map(
      (enkeltLand) =>
        soknadslandFaktaer.find((avklaring) => avklaring.subjektID === enkeltLand) || {
          ...avklartFaktaTemplate,
          referanse: KV.Koder.avklartefaktaKoder.SOKNADSLAND,
          subjektID: enkeltLand,
          fakta: ["TRUE"],
        }
    )
);

/* Avklart fakta om søker er yrkesaktiv, ytelsesmottaker etc. */
export const Yrkesgruppe = createSelector(
  (state) => AvklartefaktaSelector(state),
  (alleAvklarteFakta) => {
    const avklartFakta = alleAvklarteFakta.find(
      (avklaring) => avklaring.referanse === KV.Koder.avklartefaktaKoder.YRKESGRUPPE
    );
    if (!avklartFakta) return null;
    return avklartFakta.fakta[0];
  }
);

/* Avklart fakta om søker er ordinær arbeidstaker, selvstendig næringsdrivende, begge deler eller tjenesteperson. */
export const Yrkesaktivitet = createSelector(
  (state) => AvklartefaktaSelector(state),
  (alleAvklarteFakta) => {
    const avklartFakta = alleAvklarteFakta.find(
      (avklaring) => avklaring.referanse === KV.Koder.avklartefaktaKoder.YRKESAKTIVITET
    );
    if (!avklartFakta) return null;
    return avklartFakta.fakta[0];
  }
);

const konverterForetakUtlandTilVirksomhet = (foretakUtland) => ({
  navn: foretakUtland.navn,
  virksomhetId: foretakUtland.uuid,
  adresse: {
    land: KV.kodeTilTerm(foretakUtland.adresse.landkode, MKV.KTObjects.landkoder),
  },
});

const konverterOrganisasjonTilVirksomhet = (org) => ({
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
  (state) => behandlingerSelectors.ArbeidsforholdSelector(state),
  (state) => behandlingerSelectors.OrganisasjonerSelector(state),
  (state) => mottatteOpplysningerSelectors.ValiderteEkstraArbeidsgivereSelector(state),
  (state) => mottatteOpplysningerSelectors.SelvstendigNaringsvirksomhetSelector(state),
  (state) => mottatteOpplysningerSelectors.ForetakUtlandSelector(state),
  (arbeidsforholdene, organisasjoner, ekstraArbeidsgivere, selvstendigeNaringer, foretakUtland) => {
    const relevanteOrganisasjoner = organisasjoner.filter((organisasjonen) => {
      const organisasjonenHarArbeidsforhold = arbeidsforholdene.some(
        (forholdet) => forholdet.opplysningspliktigID === organisasjonen.orgnr
      );
      return organisasjonenHarArbeidsforhold;
    });

    const foretakUtlandMedNavn = foretakUtland.filter((foretak) => foretak.navn);

    return Utils._uniqBy(
      [
        ...relevanteOrganisasjoner.map(konverterOrganisasjonTilVirksomhet),
        ...ekstraArbeidsgivere.map(konverterOrganisasjonTilVirksomhet),
        ...selvstendigeNaringer.map(konverterOrganisasjonTilVirksomhet),
        ...foretakUtlandMedNavn.map(konverterForetakUtlandTilVirksomhet),
      ],
      ({ virksomhetId }) => virksomhetId
    );
  }
);

/* Det er kun virksomheter som saksbehandler har krysset av som skal være med videre som grunnlag
 * for vurderingen. Alle virksomheter som ikke er krysset av skal automatisk markeres som om de ikke er med videre
 * dvs "FALSE" som fakta.
 */
export const VirksomhetFaktaerSelector = createSelector(
  (state) => AvklartefaktaSelector(state),
  (state) => VirksomheterIPeriodenSelector(state),
  (alleAvklarteFakta, alleVirksomheter) => {
    const avklartefakta = alleAvklarteFakta.filter(
      (avklaring) => avklaring.referanse === KV.Koder.avklartefaktaKoder.VIRKSOMHET
    );

    return alleVirksomheter.reduce((virksomhetFaktaer, virksomhet) => {
      const eksisterendeVirksomhetFakta = avklartefakta.find((fakta) => fakta.subjektID === virksomhet.virksomhetId);

      if (eksisterendeVirksomhetFakta) return [...virksomhetFaktaer, eksisterendeVirksomhetFakta];
      return virksomhetFaktaer;
    }, []);
  }
);

const AvklarteVirksomhetFaktaerSelector = createSelector(VirksomhetFaktaerSelector, (virksomhetFaktaer) =>
  virksomhetFaktaer.filter((virksomhet) => virksomhet.fakta.includes(BOOLSK_STRING.SANN))
);

export const ArbeidSokkelSkipSelector = createSelector(
  (state) => AvklartefaktaSelector(state),
  (alleAvklarteFakta) => {
    const avklartFakta = alleAvklarteFakta.find(
      (avklaring) => avklaring.referanse === KV.Koder.avklartefaktaKoder.ARBEID_SOKKEL_SKIP
    );
    if (!avklartFakta) return null;
    return avklartFakta.fakta[0];
  }
);

export const InstallasjonsTypeSelector = createSelector(
  (state) => AvklartefaktaSelector(state),
  (alleAvklarteFakta) => {
    const avklartFakta = alleAvklarteFakta.find(
      (avklaring) => avklaring.referanse === KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP
    );
    if (!avklartFakta) return null;
    return avklartFakta.fakta[0];
  }
);

/* Avklartfakta for hvorvidt en installasjon er SOKKEL eller SKIP.
 * Selectoren henter avklaringer fra redux state og omformer de til array<object> som
 * Redux Form kan lese.
 */
export const SokkelEllerSkipSelector = createSelector(
  (state) => AvklartefaktaSelector(state),
  (state) => mottatteOpplysningerSelectors.MaritimtArbeidSelector(state),
  (alleAvklarteFakta, alleMaritimeArbeid) => {
    // Selectoren lager 2 lister - en for avklart fakta for arbeidsland for hvert sokkel / skip
    // og én for avklartfakta om installasjonen er sokkel eller skip.

    const arbeidsland = alleAvklarteFakta
      .filter((avklaring) => avklaring.referanse === KV.Koder.referanseKoder.INSTALLASJON_ARBEIDSLAND)
      .map((avklaring) => avklaring.fakta[0]);

    const sokkelEllerSkip = alleAvklarteFakta
      .filter((avklaring) => avklaring.referanse === KV.Koder.avklartefaktaKoder.SOKKEL_ELLER_SKIP)
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
  (state) => Soknadsland(state) || [],
  (avklartefaktaLandListe) =>
    avklartefaktaLandListe
      .filter((avklartfakta) => avklartfakta.fakta.includes("TRUE"))
      .map((avklartfakta) => avklartfakta.subjektID)
);

const MaritimeArbeidslandSelector = createSelector(
  (state) => SokkelEllerSkipSelector(state),
  (sokkelEllerSkipListe) =>
    sokkelEllerSkipListe.map((sokkelEllerSkip) => sokkelEllerSkip.arbeidsland).filter((arbeidsland) => arbeidsland)
);

export const ArbeidslandSelector = createSelector(
  (state) => SoknadslandSelector(state),
  (state) => MaritimeArbeidslandSelector(state),
  (state) => behandlingerSelectors.BehandlingstemaKodeSelector(state),
  IkkeArbeidslandSoknadslandSelector,
  (state) => mottatteOpplysningerSelectors.HjemmebaserSelector(state),
  (soknadsland, maritimeArbeidsland, behandlingstema, IkkeArbeidslandSoknadland, hjemmebaser) => {
    if (behandlingstema === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND) {
      const vurderteArbeidsland = [...hjemmebaser, ...soknadsland, ...maritimeArbeidsland].filter(
        (land) => !IkkeArbeidslandSoknadland.includes(land)
      );
      const unikeVurderteArbeidsland = [...new Set(vurderteArbeidsland)];
      return unikeVurderteArbeidsland;
    }

    if (maritimeArbeidsland.length > 0) return maritimeArbeidsland;
    return soknadsland;
  }
);
export const AlleArbeidslandSelector = createSelector(
  (state) => mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
  (state) => MaritimeArbeidslandSelector(state),
  (state) => AvklarteVirksomheterSelector(state),
  (state) => mottatteOpplysningerSelectors.HjemmebaserSelector(state),
  (soknadslandkoder = [], maritimeArbeidsland = [], valgteVirksomheter = []) => {
    return [
      ...soknadslandkoder,
      ...maritimeArbeidsland,
      ...valgteVirksomheter.map((virksomhet) =>
        KV.termTilKode(Utils.streng.storeForbokstaverForLand(virksomhet.adresse.land), MKV.KTObjects.landkoder)
      ),
    ];
  }
);

const erLonnetArbeidNorge = (arbeidsgivereNorge, fysiskeArbeidssteder) =>
  arbeidsgivereNorge.length > 0 ||
  fysiskeArbeidssteder.some((arbeidssted) => arbeidssted.adresse.landkode === MKV.Koder.landkoder.NO);

const erLonnetArbeidUtland = (utland, fysiskeArbeidssteder, foretakUtland) =>
  fysiskeArbeidssteder.some((arbeidssted) => arbeidssted.adresse.landkode === utland) ||
  foretakUtland
    .filter((foretak) => !foretak.selvstendigNaeringsvirksomhet)
    .some((foretak) => foretak.adresse.landkode === utland);

const erSelvstendigNaeringsvirksomhetNorge = (selvstendigArbeid) =>
  selvstendigArbeid.erSelvstendig && selvstendigArbeid.selvstendigForetak.length > 0;

const erSelvstendigNaeringsvirksomhetUtland = (utland, foretakUtland) =>
  foretakUtland
    .filter((foretak) => foretak.selvstendigNaeringsvirksomhet)
    .some((foretak) => foretak.adresse.landkode === utland);

export const ArbeidslandKTSelector = createSelector(
  (state) => ArbeidslandSelector(state),
  (arbeidsland) => MKV.KTObjects.landkoder.filter((landkodeObjekt) => arbeidsland.includes(landkodeObjekt.kode))
);

const byggLandMedYrkesAktivitet = ({
  land,
  fysiskeArbeidssteder,
  foretakUtland,
  selvstendigArbeid,
  arbeidsgivereNorge,
}) => {
  const erNorge = land.kode === MKV.Koder.landkoder.NO;
  const erLonnetArbeid = erNorge
    ? erLonnetArbeidNorge(arbeidsgivereNorge, fysiskeArbeidssteder)
    : erLonnetArbeidUtland(land.kode, fysiskeArbeidssteder, foretakUtland);
  const erSelvstendigNaeringsvirksomhet = erNorge
    ? erSelvstendigNaeringsvirksomhetNorge(selvstendigArbeid)
    : erSelvstendigNaeringsvirksomhetUtland(land.kode, foretakUtland);

  return {
    land,
    erLonnetArbeid,
    erSelvstendigNaeringsvirksomhet,
  };
};

export const ArbeidslandMedYrkesAktivitetSelector = createSelector(
  ArbeidslandKTSelector,
  (state) => mottatteOpplysningerSelectors.FysiskeArbeidsstederSelector(state),
  (state) => mottatteOpplysningerSelectors.ForetakUtlandSelector(state),
  (state) => mottatteOpplysningerSelectors.SelvstendigArbeidSelector(state),
  (state) => behandlingerSelectors.ArbeidsgivereNorgeSelector(state),
  (arbeidsland, fysiskeArbeidssteder, foretakUtland, selvstendigArbeid, arbeidsgivereNorge) =>
    arbeidsland.map((land) =>
      byggLandMedYrkesAktivitet({
        land,
        fysiskeArbeidssteder,
        foretakUtland,
        selvstendigArbeid,
        arbeidsgivereNorge,
      })
    )
);

const MarginaltArbeidFaktaerSelector = createSelector(AvklartefaktaSelector, (avklartefakta) =>
  avklartefakta.filter((enkelt) => enkelt.referanse === MKV.Koder.avklartefaktatyper.MARGINALT_ARBEID)
);

const MarginaleArbeidslandFaktaerSelector = createSelector(MarginaltArbeidFaktaerSelector, (marginaltArbeidFakta) =>
  marginaltArbeidFakta.filter((enkelt) => enkelt.fakta.includes(BOOLSK_STRING.SANN))
);

const MarginaleArbeidslandSelector = createSelector(
  (state) => MarginaleArbeidslandFaktaerSelector(state) || [],
  (marginaleArbeidslandFaktaer) => marginaleArbeidslandFaktaer.map((fakta) => fakta.subjektID)
);

export const IkkeMarginaleArbeidslandSelector = createSelector(
  (state) => ArbeidslandSelector(state) || [],
  (state) => MarginaleArbeidslandSelector(state) || [],
  (arbeidsland, marginaleArbeidsland) => arbeidsland.filter((land) => !marginaleArbeidsland.includes(land))
);

export const IkkeMarginaleArbeidslandKTSelector = createSelector(
  (state) => IkkeMarginaleArbeidslandSelector(state) || [],
  (ikkeMarginaleArbeidsland) =>
    MKV.KTObjects.landkoder.filter((landkodeObjekt) => ikkeMarginaleArbeidsland.includes(landkodeObjekt.kode))
);

const overlappende = (liste1, liste2) => liste1.filter((element) => liste2.includes(element));

export const LandMedVesentligEllerRegistrertArbeidSelector = createSelector(
  (state) => IkkeMarginaleArbeidslandSelector(state) || [],
  (state) => ArbeidslandSelector(state) || [],
  (state) => mottatteOpplysningerSelectors.ForetakUtlandLandkodeSelector(state) || [],
  (state) => mottatteOpplysningerSelectors.FysiskeArbeidsstederLandkoderSelector(state) || [],
  (ikkeMarginaleArbeidsland, arbeidsland, foretakUtland, fysiskeArbeidssteder) => [
    ...new Set([
      ...ikkeMarginaleArbeidsland,
      ...overlappende(arbeidsland, foretakUtland),
      ...overlappende(arbeidsland, fysiskeArbeidssteder),
    ]),
  ]
);

export const LandSomKreverSEDSelector = createSelector(
  (state) => LandMedVesentligEllerRegistrertArbeidSelector(state) || [],
  (state) => utpekingsperioderSelectors.LovvalgslandSelector(state),
  (landSomKreverSED, utpektLovvalgsland) => [
    ...new Set([...landSomKreverSED, ...(utpektLovvalgsland ? [utpektLovvalgsland] : [])]),
  ]
);

export const LandSomKreverSEDKTSelector = createSelector(
  (state) => LandSomKreverSEDSelector(state),
  (arbeidsland) => MKV.KTObjects.landkoder.filter((landkodeObjekt) => arbeidsland.includes(landkodeObjekt.kode))
);

const AlleOrganisasjonerSelector = createSelector(
  (state) => behandlingerSelectors.OrganisasjonerSelector(state),
  (state) => OrganisasjonSelectors.organisasjonerSelector(state),
  (fagsakOrganisasjoner, soknadOrganisasjoner) => [...fagsakOrganisasjoner, ...soknadOrganisasjoner]
);

export const AvklarteNorskeVirksomheterSelector = createSelector(
  AvklarteVirksomhetFaktaerSelector,
  AlleOrganisasjonerSelector,
  (alleAvklarteVirksomhetFaktaer, alleOrganisasjoner) =>
    alleAvklarteVirksomhetFaktaer
      .map((virksomhet) => {
        const avklartOrganisasjon = alleOrganisasjoner.find((org) => org.orgnr === virksomhet.subjektID);
        if (avklartOrganisasjon) return konverterOrganisasjonTilVirksomhet(avklartOrganisasjon);
        return null;
      })
      .filter((virksomhet) => virksomhet)
);

export const AvklarteUtenlandskeVirksomheterSelector = createSelector(
  AvklarteVirksomhetFaktaerSelector,
  (state) => mottatteOpplysningerSelectors.ForetakUtlandSelector(state),
  (alleAvklarteVirksomhetFaktaer, foretakUtland) =>
    alleAvklarteVirksomhetFaktaer
      .map((virksomhet) => {
        const avklartForetak = foretakUtland.find((foretak) => foretak.uuid === virksomhet.subjektID);
        if (avklartForetak) return konverterForetakUtlandTilVirksomhet(avklartForetak);
        return null;
      })
      .filter((virksomhet) => virksomhet)
);

export const AvklarteVirksomheterSelector = createSelector(
  AvklarteNorskeVirksomheterSelector,
  AvklarteUtenlandskeVirksomheterSelector,
  (avklarteNorskeVirksomheter, avklarteUtenlandskeVirksomheter) => [
    ...avklarteNorskeVirksomheter,
    ...avklarteUtenlandskeVirksomheter,
  ]
);

export const AvklarteVirksomheterIkkeNaeringsdrivendeSelector = createSelector(
  AvklarteVirksomhetFaktaerSelector,
  AlleOrganisasjonerSelector,
  (state) => mottatteOpplysningerSelectors.ForetakUtlandSelector(state),
  (state) => mottatteOpplysningerSelectors.SelvstendigArbeidForetakSelector(state),
  (alleAvklarteVirksomhetFaktaer, alleOrganisasjoner, foretakUtland, selvstendigArbeidForetak) =>
    alleAvklarteVirksomhetFaktaer
      .map((virksomhet) => {
        const avklartForetakUtland = foretakUtland.find((foretak) => foretak.uuid === virksomhet.subjektID);
        if (avklartForetakUtland) {
          return avklartForetakUtland.selvstendigNaeringsvirksomhet
            ? null
            : konverterForetakUtlandTilVirksomhet(avklartForetakUtland);
        }

        const avklartSelvstendigArbeid = selvstendigArbeidForetak.find(
          (foretak) => foretak.orgnr === virksomhet.subjektID
        );
        if (avklartSelvstendigArbeid) return null;

        const avklartOrganisasjon = alleOrganisasjoner.find((org) => org.orgnr === virksomhet.subjektID);
        if (avklartOrganisasjon) return konverterOrganisasjonTilVirksomhet(avklartOrganisasjon);

        throw new Error("Avklart virksomhet må enten tilhøre et utenlandsk foretak eller en organisasjon");
      })
      .filter((virksomhet) => virksomhet)
);

export const BostedslandSelector = createSelector(
  (state) => AvklartefaktaSelector(state),
  (alleAvklarteFakta) => {
    const avklartFakta = alleAvklarteFakta.find(
      (avklaring) => avklaring.referanse === KV.Koder.avklartefaktaKoder.BOSTEDSLAND
    );
    if (!avklartFakta) return null;
    const bostedslandkode = hentFaktaVerdi(avklartFakta);
    return MKV.KTObjects.landkoder.find((enkeltLand) => enkeltLand.kode === bostedslandkode);
  }
);

export const OmfattesILandFaktaSelector = createSelector(AvklartefaktaSelector, (avklarteFakta) =>
  avklarteFakta.find((avklaring) => avklaring.referanse === KV.Koder.avklartefaktaKoder.OMFATTES_I_LAND)
);

export const OmfattesILandSelector = createSelector(OmfattesILandFaktaSelector, (omfattesILandFakta) =>
  hentFaktaVerdi(omfattesILandFakta)
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

export const OffentligArbeidAntallLandFaktaSelector = createSelector(AvklartefaktaSelector, (avklartefakta) =>
  avklartefakta.find((avklaring) => avklaring.referanse === KV.Koder.avklartefaktaKoder.OFFENTLIG_ARBEID_ANTALL_LAND)
);

export const OffentligArbeidAntallLandFaktaVerdiSelector = createSelector(
  OffentligArbeidAntallLandFaktaSelector,
  (offentligArbeidAntallLandFakta) => hentFaktaVerdi(offentligArbeidAntallLandFakta)
);

export const LoennetArbeidAntallLandFaktaSelector = createSelector(AvklartefaktaSelector, (avklartefakta) =>
  avklartefakta.find((avklaring) => avklaring.referanse === KV.Koder.avklartefaktaKoder.LOENNET_ARBEID_ANTALL_LAND)
);

export const LoennetArbeidAntallLandFaktaVerdiSelector = createSelector(
  LoennetArbeidAntallLandFaktaSelector,
  (loennetArbeidAntallLandFakta) => hentFaktaVerdi(loennetArbeidAntallLandFakta)
);
