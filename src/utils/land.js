import * as Streng from "./streng";

export const landTekstFormat = (landObjekt) => `${landObjekt.term} (${landObjekt.kode})`;
export const landTekstFormatStoreForbokstaver = (landObjekt) =>
  `${Streng.storeForbokstaver(landObjekt.term)} (${landObjekt.kode})`;
