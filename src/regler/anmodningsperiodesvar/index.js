import { konverterEnkelDataTilStegData, lagEnkelData, slettEnkelData } from '../enkelData';

export const anmodningsperiodesvartype = 'anmodningsperiodesvar';

export const slettAnmodningsperiodesvar = felt => slettEnkelData(felt, anmodningsperiodesvartype);

export const lagAnmodningsperiodesvar = felt => lagEnkelData(felt, anmodningsperiodesvartype);

export const konverterAnmodningsperiodesvarTilStegData = anmodningsperiodesvar => konverterEnkelDataTilStegData(anmodningsperiodesvar, anmodningsperiodesvartype);
