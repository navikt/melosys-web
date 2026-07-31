import { API_BASE_URL, TEKSTBLOKKER } from "../api-constants";
import { deleteAsJson, getAsJson, postAsJson, putAsJson } from "../utils";

export type TekstblokkType = "TEKSTBLOKK" | "BREVMAL";

export type TekstblokkStatus = "UTKAST" | "PUBLISERT";

export type Endringstype = "OPPRETTET" | "ENDRET" | "SLETTET";

export interface TekstblokkOversikt {
  id: number;
  tittel: string;
  innhold: string;
  type: TekstblokkType;
  tags: string[];
  // Kodeverdier (EU_EOS, UTSENDT_ARBEIDSTAKER …). Tom liste betyr «gjelder alle».
  sakstyper: string[];
  behandlingstemaer: string[];
  status: TekstblokkStatus;
  endretDato: string;
  endretAv: string;
  endretAvNavn: string | null;
}

export interface Tekstblokk {
  id: number;
  tittel: string;
  innhold: string;
  type: TekstblokkType;
  tags: string[];
  sakstyper: string[];
  behandlingstemaer: string[];
  status: TekstblokkStatus;
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
  sakstyper: string[];
  behandlingstemaer: string[];
  status?: TekstblokkStatus;
}

export interface TekstblokkVersjon {
  versjon: number;
  gyldigFra: string;
  gyldigTil: string | null;
  endretAv: string;
  endretAvNavn: string | null;
  endringstype: Endringstype;
  tittel: string;
  innhold: string;
}

const baseUrl = `${API_BASE_URL}${TEKSTBLOKKER}`;

type Normaliserbar = { sakstyper?: string[]; behandlingstemaer?: string[]; status?: TekstblokkStatus };
type Normalisert = Pick<TekstblokkOversikt, "sakstyper" | "behandlingstemaer" | "status">;

// Et api uten avgrensning eller status (under utrulling) utelater feltene. Vi normaliserer her, på
// api-grensen, slik at alle konsumenter kan regne med lister og en status.
const normaliser = (blokk: Normaliserbar): Normalisert => ({
  sakstyper: blokk.sakstyper ?? [],
  behandlingstemaer: blokk.behandlingstemaer ?? [],
  status: blokk.status ?? "PUBLISERT",
});

export const hentAlle = (type?: TekstblokkType): Promise<TekstblokkOversikt[]> => {
  const url = type ? `${baseUrl}?type=${type}` : baseUrl;
  return getAsJson(url).then((blokker: TekstblokkOversikt[]) =>
    blokker.map((blokk) => ({ ...blokk, ...normaliser(blokk) })),
  );
};

export const hent = (id: number): Promise<Tekstblokk> =>
  getAsJson(`${baseUrl}/${id}`).then((blokk: Tekstblokk) => ({ ...blokk, ...normaliser(blokk) }));

export const opprett = (body: TekstblokkRequest): Promise<Tekstblokk> =>
  postAsJson(baseUrl, body).then((blokk: Tekstblokk) => ({ ...blokk, ...normaliser(blokk) }));

export const oppdater = (id: number, body: TekstblokkRequest): Promise<Tekstblokk> =>
  putAsJson(`${baseUrl}/${id}`, body).then((blokk: Tekstblokk) => ({ ...blokk, ...normaliser(blokk) }));

export const publiser = (id: number): Promise<Tekstblokk> =>
  postAsJson(`${baseUrl}/${id}/publiser`).then((blokk: Tekstblokk) => ({ ...blokk, ...normaliser(blokk) }));

export const hentHistorikk = (id: number): Promise<TekstblokkVersjon[]> => getAsJson(`${baseUrl}/${id}/historikk`);

export const slett = (id: number): Promise<unknown> => deleteAsJson(`${baseUrl}/${id}`);

export type Statusfilter = "ALLE" | "PUBLISERT" | "UTKAST";

export const harStatus = (blokk: Pick<TekstblokkOversikt, "status">, filter: Statusfilter): boolean =>
  filter === "ALLE" || blokk.status === filter;

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

// Avgrensningen er støyreduksjon, ikke sikkerhet: en tom avgrensning gjelder alle, og en
// tom kontekstverdi (admin, som ikke står i en sak) filtrerer ingenting bort.
const passerAvgrensning = (avgrensning: string[], kontekstverdi?: string): boolean =>
  avgrensning.length === 0 || !kontekstverdi || avgrensning.includes(kontekstverdi);

export const gjelderKontekst = (
  blokk: Pick<TekstblokkOversikt, "sakstyper" | "behandlingstemaer">,
  sakstype?: string,
  behandlingstema?: string,
): boolean =>
  passerAvgrensning(blokk.sakstyper, sakstype) && passerAvgrensning(blokk.behandlingstemaer, behandlingstema);

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

// Teller tags i utvalget, men tar alltid med de valgte tagene – om nødvendig med 0.
// Uten dette ville en valgt tag forsvinne fra filteret når kombinasjonen ikke gir treff,
// og da kunne den ikke fjernes igjen.
export const tellTagsMedValgte = (blokker: TekstblokkOversikt[], valgteTags: string[]): Array<[string, number]> => {
  // Valgte tags vises med skrivemåten brukeren valgte, ikke den tilfeldige skrivemåten
  // som først dukker opp i utvalget – ellers slutter chip/nedtrekk å matche det valgte.
  const telling = tellTags(blokker).map(([tag, antall]): [string, number] => [
    valgteTags.find((valgt) => valgt.toLowerCase() === tag.toLowerCase()) ?? tag,
    antall,
  ]);
  const manglende = valgteTags.filter((valgt) => !telling.some(([tag]) => tag.toLowerCase() === valgt.toLowerCase()));
  return [...telling, ...manglende.map((tag): [string, number] => [tag, 0])];
};

// Blokken må ha alle de valgte tagene, ikke bare én av dem – velger du "storbritannia"
// og "skip" skal du få blokkene om britiske skip, ikke alt om Storbritannia pluss alt om
// skip. Sammenligner case-insensitivt, i tråd med at tellTags grupperer case-insensitivt.
export const harAlleTags = (blokk: TekstblokkOversikt, valgteTags: string[]): boolean => {
  if (valgteTags.length === 0) return true;
  const blokkTags = blokk.tags.map((t) => t.toLowerCase());
  return valgteTags.every((t) => blokkTags.includes(t.toLowerCase()));
};

// Case-insensitiv, i tråd med tellTags og harAlleTags. Tags bevarer bokstavstørrelse, så
// samme tag kan vises som "Skip" i én blokk og "skip" i en annen.
export const toggleITagliste = (liste: string[], tag: string): string[] =>
  liste.some((t) => t.toLowerCase() === tag.toLowerCase())
    ? liste.filter((t) => t.toLowerCase() !== tag.toLowerCase())
    : [...liste, tag];

export const erTagValgt = (valgteTags: string[], tag: string): boolean =>
  valgteTags.some((t) => t.toLowerCase() === tag.toLowerCase());

// Legger til en tag i lista. Bevarer bokstavstørrelse (f.eks. "USA-avtale") og mellomrom;
// kun ytterkanter trimmes. Tomt utkast og duplikater (case-insensitivt) ignoreres.
// Ligger her fordi både tag-feltet og lagringen i redigeringsmodalen bruker den.
export const leggTilTag = (verdier: string[], raaTag: string): string[] => {
  const ny = raaTag.trim().replace(/\s+/g, " ");
  if (!ny) return verdier;
  if (verdier.some((t) => t.toLowerCase() === ny.toLowerCase())) return verdier;
  return [...verdier, ny];
};
