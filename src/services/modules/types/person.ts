import { KTObject } from "@navikt/melosys-kodeverk";

export interface Familiemedlem {
  fnr: string;
  sammensattNavn: string;
  relasjonstype: KTObject;
  alder: number | null;
  borMedBruker: boolean;
  sivilstand: KTObject | null;
  sivilstandGyldighetsperiodeFom: string | null;
  fnrAnnenForelder: string | null;
}

interface Person {
  personStatus: KTObject;
  sammensattNavn: string;
  kjoenn: KTObject;
  fnr: string;
  foedselsdato: string;
  sivilstand: KTObject;
  statsborgerskap: KTObject;
  familiemedlemmer: Familiemedlem[];
}

export default Person;
