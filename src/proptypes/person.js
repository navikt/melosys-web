/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { BostedsAdresse } from './bosted';

const PersonPropType = PT.shape({
  fnr: PT.string,
  sivilstand: PT.string,
  statsborgerskap: PT.string,
  sammensattNavn: PT.string,
  bostedsadresse: BostedsAdresse,
  kjoenn: PT.string,
  foedselsdato: PT.string,
});

export { PersonPropType as Person };
