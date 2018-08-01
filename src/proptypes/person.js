/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { BostedsAdresse } from './bosted';
import { Kodeverk } from './kodeverk';

const PersonPropType = PT.shape({
  fnr: PT.string,
  sivilstand: PT.string,
  statsborgerskap: Kodeverk,
  sammensattNavn: PT.string,
  bostedsadresse: BostedsAdresse,
  kjoenn: Kodeverk,
  foedselsdato: PT.string,
});

export { PersonPropType as Person };
