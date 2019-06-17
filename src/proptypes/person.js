/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';

import { GeneriskAdresse, UstrukturertAdresse, MidlertidigAdresse } from './adresser';
import { Kodeverk } from './kodeverk';
import { Periode } from './periode';

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
  kjoenn: Kodeverk,
  foedselsdato: PT.string,
  personStatus: Kodeverk,
  personhistorikk: PT.shape({
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
  }),
  erEgenAnsatt: PT.bool,
  familiemedlemmer: PT.arrayOf(FamiliemedlemmerPropType),
});

export { PersonPropType as Person };
