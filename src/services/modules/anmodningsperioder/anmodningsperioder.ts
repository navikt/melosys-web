import { getAsJson, postAsJson } from "../../utils";
import { ANMODNINGSPERIODER, API_BASE_URL } from "../../api-constants";
import { BasePeriode, Medlemskapsperiode } from "../types/periodeTyper";

/**
 * Anmodningsperiode for EU/EØS unntak.
 * Gjenbruker felles felt fra BasePeriode og Medlemskapsperiode.
 */
export interface Anmodningsperiode
  extends Pick<BasePeriode, "fomDato" | "tomDato">,
    Pick<Medlemskapsperiode, "trygdedekning"> {
  id?: number;
  sendtUtland?: boolean;
  lovvalgBestemmelse?: string;
  tilleggBestemmelse?: string;
  lovvalgsland: string;
  unntakFraBestemmelse?: string;
  unntakFraLovvalgsland: string;
  medlemskapsperiodeID: string;
}

export interface Anmodningsperioder {
  anmodningsperioder: Anmodningsperiode[];
}

export const send = (behandlingID: number, body: Anmodningsperioder) =>
  postAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`, body);

export const hent = (behandlingID: number) => getAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`);
