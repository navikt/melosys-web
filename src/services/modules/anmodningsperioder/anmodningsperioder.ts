import { postAsJson, getAsJson } from "../../utils";
import { API_BASE_URL, ANMODNINGSPERIODER } from "../../api-constants";

type Anmodningsperiode = {
  sendtUtland?: boolean;
  id: string;
  periode: string;
  lovvalgBestemmelse: string;
  tilleggBestemmelse: string;
  lovvalgsland: string;
  unntakFraBestemmelse: string;
  unntakFraLovvalgsland: string;
  trygdeDekning: string;
  medlemskapsperiodeID: string;
};

type Anmodningsperioder = {
  anmodningsperioder: Anmodningsperiode[];
};

export const send = (behandlingID: string, body: Anmodningsperioder) =>
  postAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`, body);

export const hent = (behandlingID: string) => getAsJson(`${API_BASE_URL}${ANMODNINGSPERIODER}/${behandlingID}`);
