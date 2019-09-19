import { konverterEnkelDataTilStegData, lagEnkelData, slettEnkelData } from '../enkelData';

export const lovvalgsbestemmelseType = 'lovvalgsbestemmelse';

export const slettLovvalgsbestemmelse = felt => slettEnkelData(felt, lovvalgsbestemmelseType);

export const hentLovvalgsbestemmelse = lovvalgsperioder => {
  const periode = lovvalgsperioder.length > 0 ? lovvalgsperioder[0] : {};
  return periode.lovvalgsbestemmelse;
};

export const finnLovvalgsbestemmelse = (lovvalgsbestemmelseKode, lovvalgsbestemmelser) => (
  lovvalgsbestemmelser
    .map(lb => lb.kode)
    .find(kode => kode === lovvalgsbestemmelseKode)
);

export const lagLovvalgsbestemmelse = felt => lagEnkelData(felt, lovvalgsbestemmelseType);

export const konverterLovvalgsbestemmelseTilStegData = lovvalgsbestemmelse => konverterEnkelDataTilStegData(lovvalgsbestemmelse, lovvalgsbestemmelseType);
