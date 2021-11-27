import { konverterEnkelDataTilStegData, lagEnkelData, slettEnkelData } from "../enkelData";

export const lovvalgsperiodeType = "lovvalgsperiode";

export const slettLovvalgsperiode = (felt) => slettEnkelData(felt, lovvalgsperiodeType);

export const lagLovvalgsperiode = (felt) => lagEnkelData(felt, lovvalgsperiodeType);

export const konverterLovvalgsperiodeTilStegData = (lovvalgsperiode) =>
  konverterEnkelDataTilStegData(lovvalgsperiode, lovvalgsperiodeType);
