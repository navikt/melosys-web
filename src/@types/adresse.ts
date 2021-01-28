import { KTObject } from "@navikt/melosys-kodeverk";

type GeneriskAdresse = {
  gateadresse: {
    gatenavn: string;
    gatenummer: number;
    husnummer: number;
    husbokstav: string;
  };
  postnr: string;
  poststed: string;
  land: KTObject | string;
};

type UstrukturertAdresse = {
  landkode: string;
  adresselinjer: string[];
};

type StrukturertAdresse = {
  gatenavn: string | null;
  husnummer: string | null;
  region: string | null;
  postnummer: string | null;
  poststed: string | null;
  landkode: string | null;
};

type MidlertidigAdresse = {
  adressetype: string;
  strukturertAdresse: StrukturertAdresse;
  ustrukturertAdresse: UstrukturertAdresse;
};

export type { GeneriskAdresse, UstrukturertAdresse, MidlertidigAdresse, StrukturertAdresse };
