import MKV from './filtrertmelosyskodeverk';
import * as Utils from '../utils/';

export const alleLovvalg = [
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004,
  ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009,
  ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004,
];

export const valgbareLovvalgsbestemmelserSEDA003 = alleLovvalg.filter(({ kode }) => (
  kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A ||
  kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B1 ||
  kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B2 ||
  kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B3 ||
  kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B4 ||
  kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2A ||
  kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_2B ||
  kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_3 ||
  kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_4 ||
  kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_987_2009.FO_987_2009_ART14_11 ||
  kode === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART87_8 ||
  kode === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART87A
));

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

const kodeverkComparator = ({ kode: k1 }, { kode: k2 }) => k1.localeCompare(k2);

export const unntaksbestemmelser = Utils._uniqBy(
  [...alleLovvalg].filter(({ kode }) => !bestemmelserIkkeRelevanteForUnntak.includes(kode)),
  ({ kode }) => kode
).sort(kodeverkComparator);
