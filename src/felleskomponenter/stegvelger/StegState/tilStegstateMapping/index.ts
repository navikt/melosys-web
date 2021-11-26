import { anmodningsperiodesvartype } from "./anmodningsperiodesvar";
import { avklartefaktaType } from "./avklartefakta";
import { lovvalgsbestemmelseType } from "./lovvalgsbestemmelser";
import { tilleggBestemmelseType } from "./tilleggbestemmelser";
import { unntakfrabestemmelseType } from "./unntakfrabestemmelse";
import { vilkaarType } from "./vilkar";
import { lovvalgsperiodeType } from "./lovvalgsperiode";
import { lovvalgslandType } from "./lovvalgsland";

export * from "./anmodningsperiodesvar";
export * from "./enkelData";
export * from "./avklartefakta";
export * from "./lovvalgsbestemmelser";
export * from "./lovvalgsland";
export * from "./tilleggbestemmelser";
export * from "./unntakfrabestemmelse";
export * from "./lovvalgsperiode";
export * from "./vilkar";

const StegStoreTyper = {
  Anmodningsperiodersvar: anmodningsperiodesvartype,
  Avklartefakta: avklartefaktaType,
  Lovvalgsbestemmelser: lovvalgsbestemmelseType,
  Tilleggbestemmelser: tilleggBestemmelseType,
  UnntakFraBestemmelse: unntakfrabestemmelseType,
  Vilkar: vilkaarType,
  Lovvalgsperiode: lovvalgsperiodeType,
  Lovvalgsland: lovvalgslandType,
};

export { StegStoreTyper };
