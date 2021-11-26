import { konverterEnkelDataTilStegData, lagEnkelData, slettEnkelData } from "../enkelData";

export const unntakfrabestemmelseType = "unntakfrabestemmelse";

export const slettUnntakFraBestemmelse = (felt) => slettEnkelData(felt, unntakfrabestemmelseType);

export const lagUnntakFraBestemmelse = (felt) => lagEnkelData(felt, unntakfrabestemmelseType);

export const konverterUnntakFraBestemmelseTilStegData = (unntakFraBestemmelse) =>
  konverterEnkelDataTilStegData(unntakFraBestemmelse, unntakfrabestemmelseType);
