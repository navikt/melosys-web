import { KTObject } from 'melosys-kodeverk';

import { GeneriskAdresse, UstrukturertAdresse, MidlertidigAdresse } from './adresse';
import { Periode } from './periode';

type Familiemedlemmer = {
  sammensattNavn: string,
  fnr: string,
  relasjonstype: KTObject,
};

type Person = {
  fnr: string,
  sivilstand: KTObject,
  statsborgerskap: KTObject,
  statsborgerskapDato: string,
  sammensattNavn: string,
  kjoenn: KTObject,
  foedselsdato: string,
  personStatus: KTObject,
  personhistorikk: {
    bostedsadressePerioder: {
      bostedsadresse: GeneriskAdresse,
      periode: Periode,
    },
    postadressePerioder: {
      postadresse: UstrukturertAdresse,
      periode: Periode,
    },
    midlertidigAdressePerioder: {
      midlertidigAdresse: MidlertidigAdresse,
      periode: Periode,
    },
  },
  erEgenAnsatt: boolean,
  familiemedlemmer: Familiemedlemmer[],
};

export default Person;
