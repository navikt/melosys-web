import { unset, get, set } from 'lodash';

const fjernKode = (kodeverk, path, kode) => {
  set(kodeverk.KTObjects, path, get(kodeverk.KTObjects, path).filter(KTObject => KTObject.kode !== kode));
  const pathMedKode = `${path}.${kode}`;
  unset(kodeverk.Koder, pathMedKode);
  unset(kodeverk.Terms, pathMedKode);
};

const fjernFlereKoder = (kodeverk, koder) => {
  const rensetKodeverk = { ...kodeverk };
  koder.forEach(({ path, kode }) => fjernKode(rensetKodeverk, path, kode));

  return rensetKodeverk;
};

export { fjernFlereKoder };
