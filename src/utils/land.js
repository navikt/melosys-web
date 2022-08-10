import { storeForbokstaverForLand } from "./streng";

export const landTekstFormat = (landObjekt) => `${landObjekt.term} (${landObjekt.kode})`;

export const sorterLandOgGjørOmTilStoreForbokstaver = (landObjekter) => {
  return landObjekter
    .sort((a, b) => {
      if (a.term > b.term) return 1;
      if (b.term > a.term) return -1;
      return 0;
    })
    .map((item) => ({
      ...item,
      term: storeForbokstaverForLand(item.term),
    }));
};
