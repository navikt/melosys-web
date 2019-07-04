import PT from 'prop-types';

import { Periode } from './periode';

const UtenlandsoppholdLinjePropType = PT.shape({
  periode: Periode,
  rapporteringsperiode: PT.string,
  land: PT.string,
});

const UtenlandsoppholdPropType = PT.arrayOf(UtenlandsoppholdLinjePropType);

export {
  UtenlandsoppholdLinjePropType as UtenlandsoppholdLinje,
  UtenlandsoppholdPropType as Utenlandsopphold,
};
