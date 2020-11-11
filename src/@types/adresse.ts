import { KTObject } from '@navikt/melosys-kodeverk';

type GeneriskAdresse = {
  gateadresse: {
    gatenavn: string,
    gatenummer: number,
    husnummer: number,
    husbokstav: string,
  },
  postnr: string,
  poststed: string,
  land: KTObject | string,
};

type UstrukturertAdresse = {
  landkode: string,
  adresselinjer: string[],
};

type StrukturertAdresse = {
  gatenavn: string,
  husnummer: string,
  region: string,
  postnummer: string,
  poststed: string,
  landkode: string,
};

type MidlertidigAdresse = {
  adressetype: string,
  strukturertAdresse: StrukturertAdresse,
  UstrukturertAdresse: UstrukturertAdresse,
};

export type {
  GeneriskAdresse,
  UstrukturertAdresse,
  MidlertidigAdresse,
};
