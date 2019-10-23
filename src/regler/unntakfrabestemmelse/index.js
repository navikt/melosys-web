import { konverterEnkelDataTilStegData, lagEnkelData, slettEnkelData } from '../enkelData';

export const unntakfrabestemmelseType = 'unntakfrabestemmelse';

export const slettUnntakFraBestemmelse = felt => slettEnkelData(felt, unntakfrabestemmelseType);

export const hentUnntakFraBestemmelse = perioder => {
  const periode = perioder.length > 0 ? perioder[0] : {};
  return periode.unntakFraBestemmelse;
};

export const finnUnntakFraBestemmelse = (unntakFraBestemmelseKode, unntakFraBestemmelser) => (
  unntakFraBestemmelser
    .map(lb => lb.kode)
    .find(kode => kode === unntakFraBestemmelseKode)
);

export const lagUnntakFraBestemmelse = felt => lagEnkelData(felt, unntakfrabestemmelseType);

export const konverterUnntakFraBestemmelseTilStegData = unntakFraBestemmelse => konverterEnkelDataTilStegData(unntakFraBestemmelse, unntakfrabestemmelseType);
