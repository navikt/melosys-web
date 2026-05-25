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

export const matcherSoek = (blokk: TekstblokkOversikt, soek: string): boolean => {
  const ord = soek
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
  if (ord.length === 0) return true;

  const soekbareFelt = [blokk.tittel.toLowerCase(), ...blokk.tags.map((tag) => tag.toLowerCase())];
  // Hvert søkeord må matche minst ett felt (tittel eller en tag). Slik gir "USA avslag"
  // treff på blokker som har både "usa" og "avslag" et sted.
  return ord.every((o) => soekbareFelt.some((felt) => felt.includes(o)));
};

export const tellTags = (blokker: TekstblokkOversikt[]): Array<[string, number]> => {
  const teller = new Map<string, number>();
  blokker.forEach((blokk) => {
    blokk.tags.forEach((tag) => {
      teller.set(tag, (teller.get(tag) ?? 0) + 1);
    });
  });
  return Array.from(teller.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "nb"));
};

export const toggleITegnliste = (liste: string[], element: string): string[] =>
  liste.includes(element) ? liste.filter((e) => e !== element) : [...liste, element];
