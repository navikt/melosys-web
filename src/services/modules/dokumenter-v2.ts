import { KTObject } from "@navikt/melosys-kodeverk";
import { getAsJson } from "../utils";
import { API_BASE_URL, DOKUMENTER } from "../api-constants";

export type MottakerAdresse = {
  mottakerNavn: string;
  orgnr: string | null;
  adresselinjer: string[];
  postnr: string;
  poststed: string;
  land: string;
};
export type TilgjengeligeMalerResDto = {
  type: KTObject;
  felter:
    | {
        kode: string;
        beskrivelse: string;
        feltType: string;
        hjelpetekst: string | null;
        paakrevd: boolean;
        valg:
          | null
          | {
              kode: string;
              beskrivelse: string;
            }[];
      }[]
    | null;
  muligeMottakere: {
    type: string;
    rolle: string;
    frittValg: boolean;
    adresser: MottakerAdresse[];
    feilmelding: string | null;
  }[];
  mottakereHjelpetekst: string | null;
};

export const hentTilgjengeligeMaler = (behandlingID: number): Promise<TilgjengeligeMalerResDto[]> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/tilgjengelige-maler/${behandlingID}`);
