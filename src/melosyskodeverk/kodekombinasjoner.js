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

// Denne kan nok flyttes inn i endreBehandlingModal siden den kun brukes der etter melosys.behandle_alle_saker fjernes
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

export const unikeAvtaleland = MKV.KTObjects.landkoder
  .concat(MKV.KTObjects.trygdeavtale_myndighetsland)
  .filter((ktobjectA, index, self) => self.findIndex((ktobjectB) => ktobjectB.kode === ktobjectA.kode) === index);

export const unikeAvtalelandKoder = unikeAvtaleland.map((ktobject) => ktobject.kode);

export const landSomErTrygdeavtaleMyndighetslandOgEuEøsLand = MKV.KTObjects.landkoder.filter(
  (ktobject) => !Utils._isEmpty(MKV.Koder.trygdeavtale_myndighetsland[ktobject.kode])
);
