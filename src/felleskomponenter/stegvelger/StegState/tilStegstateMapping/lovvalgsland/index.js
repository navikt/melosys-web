import { konverterEnkelDataTilStegData, lagEnkelData, slettEnkelData } from "../enkelData";

export const lovvalgslandType = "lovvalgsland";

export const slettLovvalgsland = (felt) => slettEnkelData(felt, lovvalgslandType);

export const lagLovvalgsland = (felt) => lagEnkelData(felt, lovvalgslandType);

export const konverterLovvalgslandTilStegData = (lovvalgsland) =>
  konverterEnkelDataTilStegData(lovvalgsland, lovvalgslandType);
