import { konverterEnkelDataTilStegData, lagEnkelData, slettEnkelData } from '../enkelData';

export const lovvalgslandType = 'lovvalgsland';

export const slettLovvalgsland = felt => slettEnkelData(felt, lovvalgslandType);

export const hentLovvalgsland = lovvalgsperioder => {
  const periode = lovvalgsperioder.length > 0 ? lovvalgsperioder[0] : {};
  return periode.lovvalgsland;
};

export const finnLovvalgsland = (lovvalgslandKode, lovvalgsland) => (
  lovvalgsland
    .map(lb => lb.kode)
    .find(kode => kode === lovvalgslandKode)
);

export const lagLovvalgsland = felt => lagEnkelData(felt, lovvalgslandType);

export const konverterLovvalgslandTilStegData = lovvalgsland => konverterEnkelDataTilStegData(lovvalgsland, lovvalgslandType);
