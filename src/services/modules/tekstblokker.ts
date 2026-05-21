import { API_BASE_URL, TEKSTBLOKKER } from "../api-constants";
import { deleteAsJson, getAsJson, postAsJson, putAsJson } from "../utils";

export type TekstblokkType = "TEKSTBLOKK" | "BREVMAL";

export interface TekstblokkOversikt {
  id: number;
  tittel: string;
  type: TekstblokkType;
  tags: string[];
  endretDato: string;
  endretAv: string;
}

export interface Tekstblokk {
  id: number;
  tittel: string;
  innhold: string;
  type: TekstblokkType;
  tags: string[];
  registrertDato: string;
  registrertAv: string;
  endretDato: string;
  endretAv: string;
}

export interface TekstblokkRequest {
  tittel: string;
  innhold: string;
  type: TekstblokkType;
  tags: string[];
}

const baseUrl = `${API_BASE_URL}${TEKSTBLOKKER}`;

export const hentAlle = (type?: TekstblokkType): Promise<TekstblokkOversikt[]> => {
  const url = type ? `${baseUrl}?type=${type}` : baseUrl;
  return getAsJson(url);
};

export const hent = (id: number): Promise<Tekstblokk> => getAsJson(`${baseUrl}/${id}`);

export const opprett = (body: TekstblokkRequest): Promise<Tekstblokk> => postAsJson(baseUrl, body);

export const oppdater = (id: number, body: TekstblokkRequest): Promise<Tekstblokk> =>
  putAsJson(`${baseUrl}/${id}`, body);

export const slett = (id: number): Promise<unknown> => deleteAsJson(`${baseUrl}/${id}`);
