import { KTObject } from "@navikt/melosys-kodeverk";

export interface RegisterAdresse {
  gateadresse: {
    gatenavn: string | null;
    gatenummer: number | null;
    husnummer: number | null;
    husbokstav: string | null;
  };
  postnr: string | null;
  poststed: string | null;
  land: KTObject | string | null;
}

export interface UstrukturertAdresse {
  landkode: string;
  adresselinjer: string[];
}

type StrukturertAdresse = {
  gatenavn: string | null;
  husnummer: string | null;
  region: string | null;
  postnummer: string | null;
  poststed: string | null;
  landkode: string | null;
};

export type MidlertidigAdresse = {
  adressetype: string;
  strukturertAdresse: StrukturertAdresse;
  ustrukturertAdresse: UstrukturertAdresse;
};
