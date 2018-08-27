/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { BostedsAdresse } from './adresser';
import { Kodeverk } from './kodeverk';

const BarnPropType = PT.shape({
  sammensattNavn: PT.string,
  fnr: PT.string,
});

const PersonPropType = PT.shape({
  fnr: PT.string,
  sivilstand: PT.string,
  statsborgerskap: Kodeverk,
  sammensattNavn: PT.string,
  bostedsadresse: BostedsAdresse,
  kjoenn: Kodeverk,
  foedselsdato: PT.string,
  personStatus: Kodeverk,
  erEgenAnsatt: PT.bool,
  barn: PT.arrayOf(BarnPropType),
});

export { PersonPropType as Person };
