import MKV from "./filtrertmelosyskodeverk";
import * as Utils from "../utils";

export const alleLovvalg = [
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004,
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009,
  ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004,
];

const bestemmelserIkkeRelevanteForUnntak = [
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_1,
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3C,
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_1,
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART12_2,
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART15,
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1,
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_2,
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ANNET,
  MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART87_8,
  MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART87A,
  MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11,
];

export const standardBehandlingsTemaMedBegrensetRettigheter = [
  MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_UTSTASJONERING,
  MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK_NORSK_TRYGD_ØVRIGE,
  MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_NORGE,
  MKV.Koder.behandlinger.behandlingstema.BESLUTNING_LOVVALG_ANNET_LAND,
];

export const utvidetBehandlingsTemaMedBegrensetRettigheter = [
  ...standardBehandlingsTemaMedBegrensetRettigheter,
  MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL,
];

export const erEOS = (sakstype) => {
  return sakstype === MKV.Koder.sakstyper.EU_EOS;
};

export const erBehandlingstemaMedBegrensetRettigheter = (behandlingstema, sakstype) => {
  return erEOS(sakstype)
    ? utvidetBehandlingsTemaMedBegrensetRettigheter.includes(behandlingstema)
    : standardBehandlingsTemaMedBegrensetRettigheter.includes(behandlingstema);
};

const kodeverkComparator = ({ kode: k1 }, { kode: k2 }) => k1.localeCompare(k2);

export const unntaksbestemmelser = Utils._uniqBy(
  [...alleLovvalg].filter(({ kode }) => !bestemmelserIkkeRelevanteForUnntak.includes(kode)),
  ({ kode }) => kode
).sort(kodeverkComparator);

export const gyldigeSakstema = (sakstype) => {
  switch (sakstype) {
    case MKV.Koder.sakstyper.EU_EOS:
    case MKV.Koder.sakstyper.TRYGDEAVTALE:
      return [MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG, MKV.Koder.sakstemaer.UNNTAK, MKV.Koder.sakstemaer.TRYGDEAVGIFT];
    case MKV.Koder.sakstyper.FTRL:
      return [MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG, MKV.Koder.sakstemaer.TRYGDEAVGIFT];
    default:
      return [];
  }
};

const gyldigeBehandlingstemaTrygdeavgift = [
  MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
  MKV.Koder.behandlinger.behandlingstema.PENSJONIST,
];

const gyldigeBehandlingstemaUnntakEUEØS = [MKV.Koder.behandlinger.behandlingstema.FORESPØRSEL_TRYGDEMYNDIGHET];

const gyldigeBehandlingstemaUnntakTRYGDEAVTALE = [
  MKV.Koder.behandlinger.behandlingstema.ANMODNING_OM_UNNTAK_HOVEDREGEL,
  MKV.Koder.behandlinger.behandlingstema.REGISTRERING_UNNTAK,
];

const gyldigeBehandlingstemaMedlemskapLovvalgEUEØS = [
  MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
  MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
  MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG,
  MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
  MKV.Koder.behandlinger.behandlingstema.ARBEID_KUN_NORGE,
  MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
  MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
  MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
  MKV.Koder.behandlinger.behandlingstema.PENSJONIST,
  MKV.Koder.behandlinger.behandlingstema.FORESPØRSEL_TRYGDEMYNDIGHET,
  MKV.Koder.behandlinger.behandlingstema.TRYGDETID,
];

const gyldigeBehandlingstemaMedlemskapLovvalgFTRL = [
  MKV.Koder.behandlinger.behandlingstema.UNNTAK_MEDLEMSKAP,
  MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
  MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
  MKV.Koder.behandlinger.behandlingstema.PENSJONIST,
];

const gyldigeBehandlingstemaMedlemskapLovvalgTRYGDEAVTALE = [
  MKV.Koder.behandlinger.behandlingstema.IKKE_YRKESAKTIV,
  MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV,
  MKV.Koder.behandlinger.behandlingstema.PENSJONIST,
];

export const gyldigeBehandlingstema = (sakstype, sakstema) => {
  if (sakstema === MKV.Koder.sakstemaer.TRYGDEAVGIFT) {
    return gyldigeBehandlingstemaTrygdeavgift;
  }
  if (sakstema === MKV.Koder.sakstemaer.UNNTAK) {
    switch (sakstype) {
      case MKV.Koder.sakstyper.EU_EOS:
        return gyldigeBehandlingstemaUnntakEUEØS;
      case MKV.Koder.sakstyper.TRYGDEAVTALE:
        return gyldigeBehandlingstemaUnntakTRYGDEAVTALE;
      case MKV.Koder.sakstyper.FTRL:
      default:
        return [];
    }
  }
  if (sakstema === MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG) {
    switch (sakstype) {
      case MKV.Koder.sakstyper.EU_EOS:
        return gyldigeBehandlingstemaMedlemskapLovvalgEUEØS;
      case MKV.Koder.sakstyper.TRYGDEAVTALE:
        return gyldigeBehandlingstemaMedlemskapLovvalgTRYGDEAVTALE;
      case MKV.Koder.sakstyper.FTRL:
        return gyldigeBehandlingstemaMedlemskapLovvalgFTRL;
      default:
        return [];
    }
  }
  return [];
};
