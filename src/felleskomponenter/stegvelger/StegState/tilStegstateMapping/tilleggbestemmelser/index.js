import { konverterEnkelDataTilStegData, lagEnkelData, slettEnkelData } from "../enkelData";

export const tilleggBestemmelseType = "tilleggbestemmelse";

export const slettTilleggBestemmelse = (felt) => slettEnkelData(felt, tilleggBestemmelseType);

export const lagTilleggBestemmelse = (felt) => lagEnkelData(felt, tilleggBestemmelseType);

export const konverterTilleggBestemmelseTilStegData = (tilleggBestemmelse) =>
  konverterEnkelDataTilStegData(tilleggBestemmelse, tilleggBestemmelseType);
