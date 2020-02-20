import { konverterEnkelDataTilStegData, lagEnkelData, slettEnkelData } from '../enkelData';

export const lovvalgsperiodeType = 'lovvalgsperiode';

export const slettLovvalgsperiode = felt => slettEnkelData(felt, lovvalgsperiodeType);

export const hentLovvalgsperiode = lovvalgsperioder => {
  const periode = lovvalgsperioder.length > 0 ? lovvalgsperioder[0] : {};
  return { fomDato: periode.fomDato, tomDato: periode.tomDato };
};

export const lagLovvalgsperiode = felt => lagEnkelData(felt, lovvalgsperiodeType);

export const konverterLovvalgsperiodeTilStegData = lovvalgsperiode => konverterEnkelDataTilStegData(lovvalgsperiode, lovvalgsperiodeType);
