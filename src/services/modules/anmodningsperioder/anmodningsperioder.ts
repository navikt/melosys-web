import { getAsJson, postAsJson } from "../../utils";
import { ANMODNINGSPERIODER, API_BASE_URL } from "../../api-constants";

export interface Anmodningsperiode {
  sendtUtland?: boolean;
  id: string | null;
  fomDato: string;
  tomDato: string;
  lovvalgBestemmelse?: string;
  tilleggBestemmelse?: string;
  lovvalgsland: string;
  unntakFraBestemmelse?: string;
  unntakFraLovvalgsland: string;
  trygdeDekning: string;
  medlemskapsperiodeID: string;
}

export interface Anmodningsperioder {
  anmodningsperioder: Anmodningsperiode[];
}

export const send = (behandlingID: number, body: Anmodningsperioder) =>
  postAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`, body);

export const hent = (behandlingID: number) => getAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`);
