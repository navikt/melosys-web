import { unset, get, set, cloneDeep } from "lodash";

const fjernKode = (kodeverk, path, kode) => {
  set(
    kodeverk.KTObjects,
    path,
    get(kodeverk.KTObjects, path).filter((KTObject) => KTObject.kode !== kode)
  );
  const pathMedKode = `${path}.${kode}`;
  unset(kodeverk.Koder, pathMedKode);
  unset(kodeverk.Terms, pathMedKode);
};

const fjernFlereKoder = (kodeverk, koder) => {
  const rensetKodeverk = {
    KTObjects: cloneDeep(kodeverk.KTObjects),
    Koder: cloneDeep(kodeverk.Koder),
    Terms: cloneDeep(kodeverk.Terms),
  };
  koder.forEach(({ path, kode }) => fjernKode(rensetKodeverk, path, kode));

  return rensetKodeverk;
};

export { fjernFlereKoder };
