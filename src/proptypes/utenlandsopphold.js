import PT from 'prop-types';

import { Periode } from './periode';

const UtenlandsoppholdLinjePropType = PT.shape({
  oppholdPeriode: Periode,
  rapporteringsPeriode: PT.string,
  oppholdsland: PT.string,
});

const UtenlandsoppholdPropType = PT.arrayOf(UtenlandsoppholdLinjePropType);

export {
  UtenlandsoppholdLinjePropType as UtenlandsoppholdLinje,
  UtenlandsoppholdPropType as Utenlandsopphold,
};
