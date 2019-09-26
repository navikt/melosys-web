import { konverterEnkelDataTilStegData, lagEnkelData, slettEnkelData } from '../enkelData';

export const tilleggBestemmelseType = 'tilleggbestemmelse';

export const slettTilleggBestemmelse = felt => slettEnkelData(felt, tilleggBestemmelseType);

export const hentTilleggBestemmelse = lovvalgsperioder => {
  const periode = lovvalgsperioder.length > 0 ? lovvalgsperioder[0] : {};
  return periode.tilleggBestemmelse;
};

export const finnTilleggBestemmelse = (tilleggBestemmelseKode, tilleggBestemmelser) => (
  tilleggBestemmelser
    .map(lb => lb.kode)
    .find(kode => kode === tilleggBestemmelseKode)
);

export const lagTilleggBestemmelse = felt => lagEnkelData(felt, tilleggBestemmelseType);

export const konverterTilleggBestemmelseTilStegData = tilleggBestemmelse => konverterEnkelDataTilStegData(tilleggBestemmelse, tilleggBestemmelseType);
