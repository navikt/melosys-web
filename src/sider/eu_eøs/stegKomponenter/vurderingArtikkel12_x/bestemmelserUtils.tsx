import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";
import { KTObject } from "@navikt/melosys-kodeverk";
import { Vilkaar } from "../../../../services/modules/vilkar";

const {
  IKKE_UTSENDT_PAA_OPPDRAG_FOR_AG,
  IKKE_NORSK_AG_REGNING,
  IKKE_OMFATTET_LENGE_NOK_I_NORGE_FOER,
  IKKE_VESENTLIG_VIRKSOMHET,
} = MKV.Koder.begrunnelser.art12_1_begrunnelser;
const { IKKE_LIGNENDE_VIRKSOMHET, NORMALT_IKKE_DRIFT_NORGE } = MKV.Koder.begrunnelser.art12_2_begrunnelser;
const {
  FO_883_2004_ART12_1,
  FO_883_2004_ART12_2,
  KONV_EFTA_STORBRITANNIA_ART14_1,
  KONV_EFTA_STORBRITANNIA_ART14_2,
  KONV_EFTA_STORBRITANNIA_ART16_1,
  KONV_EFTA_STORBRITANNIA_ART16_3,
  FO_883_2004_ART16_1,
  KONV_EFTA_STORBRITANNIA_ART18_1,
} = MKV.Koder.vilkaar;

const { FO_883_2004_ART11_4_1, FO_883_2004_ART11_5 } = MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004;
const { KONV_EFTA_STORBRITANNIA_ART13_4_1, KONV_EFTA_STORBRITANNIA_ART13_5 } =
  MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_konv_efta_storbritannia;

const { SOKKEL_ELLER_SKIP, FLYENDE_PERSONELL } = KV.Koder.VurderingYrkesgruppeTyper;
const { SKIP_ETT_LAND } = KV.Koder.VurderingSokkelSkipTyper;

export enum VedtakValg {
  JA_INNVILGE = "JA_INNVILGE",
  NEI_ANMODNING_UNNTAK = "NEI_ANMODNING_UNNTAK",
  NEI_AVSLAG = "NEI_AVSLAG",
}

export const initializeVedtakValg = (
  utsendingsvilkår: Partial<Vilkaar>,
  unntaksvilkår: Partial<Vilkaar>
): VedtakValg | undefined => {
  if (utsendingsvilkår.oppfylt) {
    return VedtakValg.JA_INNVILGE;
  }
  if (utsendingsvilkår.oppfylt === false && unntaksvilkår.oppfylt) {
    return VedtakValg.NEI_ANMODNING_UNNTAK;
  }
  if (utsendingsvilkår.oppfylt === false && unntaksvilkår.oppfylt === false) {
    return VedtakValg.NEI_AVSLAG;
  }
  return undefined;
};

export const kodeTilObjektKonvGB = (bestemmelseKode: string): KTObject =>
  KV.kodeTilObjekt(bestemmelseKode, MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia);
export const kodeTilObjektEØS = (bestemmelseKode: string): KTObject =>
  KV.kodeTilObjekt(bestemmelseKode, MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004);

export const begrunnelseKoderForSokkelStorbritannia: string[] = [
  // artikler for arbeidsgiver:
  IKKE_UTSENDT_PAA_OPPDRAG_FOR_AG,
  IKKE_NORSK_AG_REGNING,
  IKKE_OMFATTET_LENGE_NOK_I_NORGE_FOER,
  IKKE_VESENTLIG_VIRKSOMHET,
  // artikler for næringsdrivende:
  IKKE_LIGNENDE_VIRKSOMHET,
  NORMALT_IKKE_DRIFT_NORGE,
];

export const finnFeltNavn = (vilkårKode?: string): string => {
  // De fleste vilkår er lagret med samme felt-navn som vilkårKoden.
  // Unntaket er de vilkårene der det er ulik logikk basert på om vilkåret er med i anmodning eller avslag
  // (også unntak for de gamle vilkårene 12.1 og 12.2 frem til vi evt skriver om)
  if (vilkårKode === FO_883_2004_ART12_1) return "art12_1";
  if (vilkårKode === FO_883_2004_ART12_2) return "art12_2";
  if (vilkårKode === FO_883_2004_ART16_1) return "art16_1";
  if (vilkårKode === KONV_EFTA_STORBRITANNIA_ART18_1) return "art18_1";

  return vilkårKode ?? "";
};

export const alleRelevanteFeltNavn: string[] = [
  "art12_1",
  "art12_2",
  KONV_EFTA_STORBRITANNIA_ART14_1,
  KONV_EFTA_STORBRITANNIA_ART14_2,
  KONV_EFTA_STORBRITANNIA_ART16_1,
  KONV_EFTA_STORBRITANNIA_ART16_3,
  "art16_1_avslag",
  "art16_1_anmodning",
  "art18_1_anmodning",
];

export const hentRelevantUtsendelseArtikkel12 = (erArbeidstaker: boolean): string =>
  erArbeidstaker ? FO_883_2004_ART12_1 : FO_883_2004_ART12_2;
export const hentRelevantUtsendelseArtikkel14 = (erArbeidstaker: boolean): string =>
  erArbeidstaker ? KONV_EFTA_STORBRITANNIA_ART14_1 : KONV_EFTA_STORBRITANNIA_ART14_2;
export const hentRelevantUtsendelseArtikkel16 = (erArbeidstaker: boolean): string =>
  erArbeidstaker ? KONV_EFTA_STORBRITANNIA_ART16_1 : KONV_EFTA_STORBRITANNIA_ART16_3;

export const finnTilleggsbestemmelse = (
  lovvalgsbestemmelse: string,
  yrkesgruppeFakta: string | undefined,
  arbeidPåSkipFakta: string | undefined
): string | undefined => {
  if (![KONV_EFTA_STORBRITANNIA_ART14_1, FO_883_2004_ART12_1].includes(lovvalgsbestemmelse)) return undefined;

  if (yrkesgruppeFakta === FLYENDE_PERSONELL) {
    return lovvalgsbestemmelse === KONV_EFTA_STORBRITANNIA_ART14_1
      ? KONV_EFTA_STORBRITANNIA_ART13_5
      : FO_883_2004_ART11_5;
  }

  if (yrkesgruppeFakta === SOKKEL_ELLER_SKIP && arbeidPåSkipFakta === SKIP_ETT_LAND) {
    return lovvalgsbestemmelse === KONV_EFTA_STORBRITANNIA_ART14_1
      ? KONV_EFTA_STORBRITANNIA_ART13_4_1
      : FO_883_2004_ART11_4_1;
  }

  return undefined;
};
