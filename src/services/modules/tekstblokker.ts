import { API_BASE_URL, TEKSTBLOKKER } from "../api-constants";
import { deleteAsJson, getAsJson, postAsJson, putAsJson } from "../utils";

export type TekstblokkType = "TEKSTBLOKK" | "BREVMAL";

export interface TekstblokkOversikt {
  id: number;
  tittel: string;
  innhold: string;
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

  // Vi søker bevisst kun i tittel og tags – ikke i innhold (fagønske).
  const soekbareFelt = [blokk.tittel.toLowerCase(), ...blokk.tags.map((tag) => tag.toLowerCase())];
  // Hvert søkeord må matche minst ett felt (tittel eller en tag). Slik gir "USA avslag"
  // treff på blokker som har både "usa" og "avslag" i tittel/tags.
  return ord.every((o) => soekbareFelt.some((felt) => felt.includes(o)));
};

export const tellTags = (blokker: TekstblokkOversikt[]): Array<[string, number]> => {
  // Grupper case-insensitivt, men behold første skrivemåte vi ser, slik at
  // "USA-avtale" og "usa-avtale" telles som samme tag i filteret.
  const teller = new Map<string, { visning: string; antall: number }>();
  blokker.forEach((blokk) => {
    blokk.tags.forEach((tag) => {
      const noekkel = tag.toLowerCase();
      const eksisterende = teller.get(noekkel);
      if (eksisterende) eksisterende.antall += 1;
      else teller.set(noekkel, { visning: tag, antall: 1 });
    });
  });
  return Array.from(teller.values())
    .map(({ visning, antall }): [string, number] => [visning, antall])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "nb"));
};

export const toggleITegnliste = (liste: string[], element: string): string[] =>
  liste.includes(element) ? liste.filter((e) => e !== element) : [...liste, element];
