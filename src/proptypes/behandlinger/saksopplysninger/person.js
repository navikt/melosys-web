/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { GeneriskAdresse } from '../../adresser';
import { Kodeverk } from '../../kodeverk';

const FamiliemedlemmerPropType = PT.shape({
  sammensattNavn: PT.string,
  fnr: PT.string,
  relasjonstype: Kodeverk,
});

const PersonPropType = PT.shape({
  fnr: PT.string,
  sivilstand: Kodeverk,
  statsborgerskap: Kodeverk,
  sammensattNavn: PT.string,
  bostedsadresse: GeneriskAdresse,
  kjoenn: Kodeverk,
  foedselsdato: PT.string,
  personStatus: Kodeverk,
  erEgenAnsatt: PT.bool,
  familiemedlemmer: PT.arrayOf(FamiliemedlemmerPropType),
});

export { PersonPropType as Person };
