import { konverterEnkelDataTilStegData, lagEnkelData } from "../enkelData";

export const anmodningsperiodesvartype = "anmodningsperiodesvar";

export const lagAnmodningsperiodesvar = (felt) => lagEnkelData(felt, anmodningsperiodesvartype);

export const konverterAnmodningsperiodesvarTilStegData = (anmodningsperiodesvar) =>
  konverterEnkelDataTilStegData(anmodningsperiodesvar, anmodningsperiodesvartype);
