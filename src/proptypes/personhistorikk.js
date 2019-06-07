import PT from 'prop-types';

import { GeneriskAdresse, UstrukturertAdresse, MidlertidigAdresse } from './adresser';
import { Periode } from './periode';

const PersonhistorikkPropType = PT.shape({
  bostedsadressePerioder: PT.arrayOf(PT.shape({
    bostedsadresse: GeneriskAdresse,
    periode: Periode,
  })),
  postadressePerioder: PT.arrayOf(PT.shape({
    postadresse: UstrukturertAdresse,
    periode: Periode,
  })),
  midlertidigAdressePerioder: PT.arrayOf(PT.shape({
    midlertidigAdresse: MidlertidigAdresse,
    periode: Periode,
  })),
});

export { PersonhistorikkPropType as Personhistorikk };
