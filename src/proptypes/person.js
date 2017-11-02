/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { BostedsAdresse } from './bosted';

const PersonPropType = PT.shape({
  fnr: PT.string,
  sivilstand: PT.string,
  statsborgerskap: PT.string,
  kjoenn: PT.string,
  fornavn: PT.string,
  etternavn: PT.string,
  sammensattNavn: PT.string,
  foedselsdato: PT.string,
  bostedsadresse: BostedsAdresse,
});

export {
  PersonPropType as Person,
};
