import Regler from './Regler';

import { anmodningsperiodesvartype } from './anmodningsperiodesvar';
import { avklartefaktaType } from './avklartefakta';
import { lovvalgsbestemmelseType } from './lovvalgsbestemmelser';
import { tilleggBestemmelseType } from './tilleggbestemmelser';
import { unntakfrabestemmelseType } from './unntakfrabestemmelse';
import { vilkaarType } from './vilkar';
import { lovvalgsperiodeType } from './lovvalgsperiode';

const StegStoreTyper = {
  Anmodningsperiodersvar: anmodningsperiodesvartype,
  Avklartefakta: avklartefaktaType,
  Lovvalgsbestemmelser: lovvalgsbestemmelseType,
  Tilleggbestemmelser: tilleggBestemmelseType,
  UnntakFraBestemmelse: unntakfrabestemmelseType,
  Vilkar: vilkaarType,
  Lovvalgsperiode: lovvalgsperiodeType,
};

export default Regler;

export { StegStoreTyper };
