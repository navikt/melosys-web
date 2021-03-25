import { KTObject } from "@navikt/melosys-kodeverk";
import { getAsJson, postAsJson } from "../utils";
import { API_BASE_URL, DOKUMENTER } from "../api-constants";

export type MottakerAdresse = {
  mottakerNavn: string;
  orgnr: string | null;
  adresselinjer: string[];
  postnr: string;
  poststed: string;
  land: string;
};

export type TilgjengeligeMaler = {
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
    adresser: MottakerAdresse[] | null;
    feilmelding: string | null;
  }[];
  mottakereHjelpetekst: string | null;
};
export type TilgjengeligeMalerResDto = TilgjengeligeMaler[];

export type OpprettBrevReqDto = {
  produserbardokument: string;
  mottaker: string;
  orgNr?: string;
  innledningFritekst?: string;
  manglerFritekst?: string;
  kontaktperson?: string | null;
  kopiMottakere: {
    rolle: string;
    orgnr?: string;
    aktørId: string;
  }[];
};

export const hentTilgjengeligeMaler = (behandlingID: number): Promise<TilgjengeligeMalerResDto> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/tilgjengelige-maler/${behandlingID}`);

export const opprettBrev = (behandlingID: number, data: OpprettBrevReqDto) =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/opprett/${behandlingID}`, data);

export const opprettUtkastBrev = (behandlingID: number, data: OpprettBrevReqDto) =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/pdf/brev/utkast/${behandlingID}`, data);
