import { KTObject } from '@navikt/melosys-kodeverk';

import { GeneriskAdresse, UstrukturertAdresse, MidlertidigAdresse } from './adresse';
import { Periode } from './periode';

type Familiemedlem = {
  sammensattNavn: string,
  fnr: string,
  relasjonstype: KTObject,
  alder: number,
  borMedBruker: boolean,
  sivilstand: KTObject,
  sivilstandGyldighetsperiodeFom: string,
  fnrAnnenForelder: string,
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
  familiemedlemmer: Familiemedlem[],
};

export type {
  Person,
  Familiemedlem,
};
