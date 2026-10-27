import MKV from "../../../melosyskodeverk";
import * as Utils from "../../../utils";

const KONVENSJON_STORBRITANNIA_IKRAFTTREDELSE = new Date(2024, 0, 1);
const MAKS_MÅNEDER_UTSENDING = 24;

const { lovvalgbestemmelser_konv_efta_storbritannia, tilleggsbestemmelser_konv_efta_storbritannia } =
  MKV.Koder.lovvalgsbestemmelser;

const konvensjonStorbritanniaBestemmelser = new Set<string>([
  ...Object.values(lovvalgbestemmelser_konv_efta_storbritannia),
  ...Object.values(tilleggsbestemmelser_konv_efta_storbritannia),
] as string[]);

const utsendingBestemmelser = new Set<string>([
  lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART14_1,
  lovvalgbestemmelser_konv_efta_storbritannia.KONV_EFTA_STORBRITANNIA_ART14_2,
]);

export const erKonvensjonStorbritanniaFørIkrafttredelse = (fom?: string, bestemmelse?: string): boolean => {
  if (!bestemmelse || !konvensjonStorbritanniaBestemmelser.has(bestemmelse)) return false;
  const fomDato = Utils.dato.norskStringTilDate(fom);
  return fomDato !== undefined && fomDato < KONVENSJON_STORBRITANNIA_IKRAFTTREDELSE;
};

export const erUtsendingStorbritanniaOver24Måneder = (fom?: string, tom?: string, bestemmelse?: string): boolean => {
  if (!bestemmelse || !utsendingBestemmelser.has(bestemmelse)) return false;
  const fomDato = Utils.dato.norskStringTilDate(fom);
  const tomDato = Utils.dato.norskStringTilDate(tom);
  if (!fomDato || !tomDato) return false;
  const sisteTillatteTom = new Date(
    fomDato.getFullYear(),
    fomDato.getMonth() + MAKS_MÅNEDER_UTSENDING,
    fomDato.getDate() - 1,
  );
  return tomDato > sisteTillatteTom;
};
