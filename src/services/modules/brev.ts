import { KTObject } from "@navikt/melosys-kodeverk";
import { getAsJson } from "../utils";
import { API_BASE_URL, DOKUMENTER } from "../api-constants";

export type TilgjengeligeMalerResDto = {
  type: KTObject;
  beskrivelse: string;
  felter:
    | {
        kode: string;
        beskrivelse: string;
        feltType: string;
        hjelpetekst: string;
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
  }[];
  mottakereHjelpetekst: string | null;
};
export const hentTilgjengeligeMaler = (behandlingID: number): Promise<TilgjengeligeMalerResDto[]> =>
  getAsJson(`${API_BASE_URL}${DOKUMENTER}/v2/tilgjengelige-maler/${behandlingID}`);
