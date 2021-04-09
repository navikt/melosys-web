import { KTObject } from "@navikt/melosys-kodeverk";
import { getAsJson, postAsJson, postAsJsonReceiveAsPDF } from "../utils";
import { API_BASE_URL, DOKUMENTER } from "../api-constants";

export type MottakerAdresse = {
  tittel: {
    mottakerNavn: string;
    orgnr: string | null;
  };
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
    orgnrSettesAvSaksbehandler: boolean;
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
    orgnr: string | null;
    aktørId: string | null;
  }[];
};

export type MuligMottaker = {
  mottakerNavn: string;
  dokumentNavn: string;
  rolle: string;
  orgnr: string | null;
  aktørId: string | null;
};

export type HentMuligeMottakereResDto = {
  hovedMottaker: MuligMottaker;
  kopiMottakere: MuligMottaker[];
  fasteMottakere: MuligMottaker[];
};

export type HentMuligeMottakereReqDto = {
  produserbartdokument: string;
  orgnr: string | null;
};

export const hentTilgjengeligeMaler = (behandlingID: number): Promise<TilgjengeligeMalerResDto> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/tilgjengelige-maler/${behandlingID}`);

export const hentMuligeMottakere = (
  behandlingID: number,
  data: HentMuligeMottakereReqDto
): Promise<HentMuligeMottakereResDto> =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/mulige-mottakere/${behandlingID}`, data);

export const opprettBrev = (behandlingID: number, data: OpprettBrevReqDto) =>
  postAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/opprett/${behandlingID}`, data);

export const opprettUtkastBrev = (behandlingID: number, data: OpprettBrevReqDto) =>
  postAsJsonReceiveAsPDF(`${API_BASE_URL}${DOKUMENTER}/v2/pdf/brev/utkast/${behandlingID}`, data, true);
