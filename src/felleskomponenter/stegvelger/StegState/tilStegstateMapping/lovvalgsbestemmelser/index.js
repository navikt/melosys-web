import { konverterEnkelDataTilStegData, lagEnkelData, slettEnkelData } from "../enkelData";

export const lovvalgsbestemmelseType = "lovvalgsbestemmelse";

export const slettLovvalgsbestemmelse = (felt) => slettEnkelData(felt, lovvalgsbestemmelseType);

export const lagLovvalgsbestemmelse = (felt) => lagEnkelData(felt, lovvalgsbestemmelseType);

export const lagLovvalgsbestemmelseIAlleSteg = (data) => ({
  felt: lovvalgsbestemmelseType,
  oppdaterRedux: true,
  type: lovvalgsbestemmelseType,
  innhold: data,
  iAlleSteg: true,
});

export const konverterLovvalgsbestemmelseTilStegData = (lovvalgsbestemmelse) =>
  konverterEnkelDataTilStegData(lovvalgsbestemmelse, lovvalgsbestemmelseType);
