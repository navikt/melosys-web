import { API_BASE_URL, BEHANDLINGER, PLACEHOLDERE } from "../api-constants";
import { getAsJson } from "../utils";

export interface PlaceholderVerdi {
  nokkel: string;
  verdi: string;
}

export interface PlaceholderBeskrivelse {
  nokkel: string;
  visningsnavn: string;
  beskrivelse: string;
  eksempel: string;
  sakstyper: string[];
}

export const hentVerdier = (behandlingId: number): Promise<{ verdier: PlaceholderVerdi[] }> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingId}/placeholdere`);

export const hentKatalog = (): Promise<{ placeholdere: PlaceholderBeskrivelse[] }> =>
  getAsJson(`${API_BASE_URL}${PLACEHOLDERE}`);

const escapeHtml = (tekst: string): string =>
  tekst
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Tooltips på markeringene (native title). Delt herfra så editor og forhåndsvisning
// forklarer markeringene likt.
export const PLACEHOLDER_UTFYLT_TITTEL = (nokkel: string): string => `Fylt inn automatisk fra saken (${nokkel})`;

export const PLACEHOLDER_UERSTATTET_TITTEL =
  "Ingen verdi tilgjengelig – fylles ut manuelt, eller erstattes automatisk ved innsetting fra Send brev";

export const PLACEHOLDER_UKJENT_TITTEL = "Ikke en gyldig placeholder – se katalogen over tilgjengelige placeholdere";

export const PLACEHOLDER_VALG_TITTEL = "Klikk for å velge mellom alternativene";

export const PLACEHOLDER_VALGT_TITTEL = "Klikk for å endre valget";

// Nøkkelen inni {…}. Trimmes så «{ saksnummer }» ikke blir feilklassifisert som ukjent.
const nokkelFraToken = (token: string): string => token.slice(1, -1).trim();

const VALG_PREFIKS = "{velg:";

// «velg:» er et reservert prefiks; nøkkelmønsteret tillater ikke kolon, så et valgtoken
// kolliderer aldri med en katalognøkkel.
const VALG_TOKEN_MONSTER = /^\{velg:[^{}<>\n]+\}$/;

// Alternativene i «A|B|C» – både fra tokenteksten og fra data-valg på et innsatt valg.
// Ett alternativ er ikke et valg, så da regnes strengen som ugyldig og gir tom liste.
export const parseValgAlternativer = (alternativStreng: string): string[] => {
  const alternativer = alternativStreng
    .split("|")
    .map((alternativ) => alternativ.trim())
    .filter(Boolean);
  return alternativer.length >= 2 ? alternativer : [];
};

// Valgtoken: {velg:A|B|C}. Ugyldig innhold gir null, og tokenet klassifiseres da som
// en vanlig (ukjent) nøkkel i stedet.
export const parseValgToken = (token: string): { alternativer: string[] } | null => {
  if (!VALG_TOKEN_MONSTER.test(token)) return null;
  const alternativer = parseValgAlternativer(token.slice(VALG_PREFIKS.length, -1));
  return alternativer.length > 0 ? { alternativer } : null;
};

export const erValgToken = (token: string): boolean => parseValgToken(token) !== null;

// Skiller gyldig-men-uten-verdi (gult) fra nøkkel som ikke finnes i katalogen (rødt).
// Uten liste – katalogen er ikke lastet, feilet eller er tom – kan vi ikke avgjøre
// gyldighet, og alt markeres gult som før.
export const erUkjentPlaceholder = (token: string, gyldigeNokler?: string[]): boolean => {
  // Valgtokener slås aldri opp i katalogen – de skal ikke kunne bli røde.
  if (erValgToken(token)) return false;
  return Boolean(gyldigeNokler?.length) && !gyldigeNokler?.includes(nokkelFraToken(token));
};

// Må speile MARKERINGSKLASSER i melosys-api service/.../tekstblokk/TekstblokkHtmlSanitizer.kt
export const PLACEHOLDER_MARKERINGSKLASSER = [
  "placeholder-uerstattet",
  "placeholder-ukjent",
  "placeholder-utfylt",
  "placeholder-valg",
  "placeholder-valgt",
];

// bracketed-text er bevisst web-only – api-et pakker aldri ut klamme-spans, siden det ville
// endret innhold fra master-æraen ved lagring med togglen av.
const MARKERINGSKLASSER = [...PLACEHOLDER_MARKERINGSKLASSER, "bracketed-text"];

// Lagrede tekstblokker/brevmaler kan ha markerings-spans fra editoren bakt inn i innholdet.
// Uten opprydding nøstes markeringene ved gjenbruk – gul legger seg utenpå blå, og en
// utfylt verdi ser ut som om den mangler. Teksten beholdes, kun spanene fjernes.
// Med et klasse-utvalg beholdes de øvrige markeringene urørt.
export const fjernMarkeringsSpans = (html: string, klasser: string[] = MARKERINGSKLASSER): string => {
  if (!MARKERINGSKLASSER.some((klasse) => html.includes(klasse))) return html;

  const dokument = new DOMParser().parseFromString(html, "text/html");
  const pakkUt = (span: Element) => span.replaceWith(...Array.from(span.childNodes));
  const velger = klasser.map((klasse) => `span.${klasse}`).join(",");
  // Ytterste span pakkes ut først; nøstede spans henger fortsatt i dokumentet etterpå.
  dokument.body.querySelectorAll(velger).forEach(pakkUt);
  // Klammemarkering inni klammemarkering er alltid overflødig – ytterste holder.
  dokument.body.querySelectorAll("span.bracketed-text span.bracketed-text").forEach(pakkUt);
  return dokument.body.innerHTML;
};

// Erstatter {nokkel} med verdien pakket i markerings-span (matcher PlaceholderBlot i
// htmlEditor). Nøkler uten verdi blir stående urørt. Regexen tillater ikke < > i
// klammene, så den treffer aldri på tvers av HTML-tagger – samme tilnærming som
// uthevPlaceholders i tekstblokkForhandsvisning.
export const erstattPlaceholdere = (html: string, verdier: PlaceholderVerdi[]): string => {
  if (verdier.length === 0) return html;
  const verdiForNokkel = new Map(verdier.map(({ nokkel, verdi }) => [nokkel, verdi]));
  return html.replace(/\{[^{}<>]+\}/g, (token) => {
    // Valgtokener har ingen saksverdi – de erstattes av brukerens valg i editoren.
    if (erValgToken(token)) return token;
    // Samme trimmede nøkkel som erUkjentPlaceholder, ellers blir «{ saksnummer }» aldri erstattet.
    const nokkel = nokkelFraToken(token);
    const verdi = verdiForNokkel.get(nokkel);
    // Tom verdi ville gitt en tom span som Quill kaster – da forsvinner {nokkel}
    // sporløst. Behold tokenet så det gulmarkeres i stedet.
    if (!verdi) return token;
    const escapetNokkel = escapeHtml(nokkel);
    return `<span class="placeholder-utfylt" data-placeholder="${escapetNokkel}" title="${PLACEHOLDER_UTFYLT_TITTEL(escapetNokkel)}">${escapeHtml(verdi)}</span>`;
  });
};
export interface UtdatertPlaceholder {
  nokkel: string;
  innsattVerdi: string;
  ferskVerdi: string;
}

// Billig sjekk på om teksten i det hele tatt har innsatte verdier å sammenligne.
export const harInnsatteVerdier = (html: string): boolean => html.includes("placeholder-utfylt");

// Innsatte verdier er frosset i brevteksten. Sammenligningen mot sakens ferske verdier
// gir grunnlag for å varsle ved sending – den endrer aldri teksten.
export const finnUtdaterteVerdier = (html: string, ferskeVerdier: PlaceholderVerdi[]): UtdatertPlaceholder[] => {
  if (!harInnsatteVerdier(html)) return [];

  const ferskForNokkel = new Map(ferskeVerdier.map(({ nokkel, verdi }) => [nokkel, verdi]));
  const dokument = new DOMParser().parseFromString(html, "text/html");
  const utdaterte: UtdatertPlaceholder[] = [];
  const rapportert = new Set<string>();

  dokument.body.querySelectorAll("span.placeholder-utfylt[data-placeholder]").forEach((span) => {
    const nokkel = span.getAttribute("data-placeholder") ?? "";
    const innsattVerdi = span.textContent ?? "";
    // Nøkkel uten fersk verdi er utgått av registeret; den rapporteres med tom ferskVerdi.
    const ferskVerdi = ferskForNokkel.get(nokkel) ?? "";
    if (ferskVerdi === innsattVerdi) return;

    // Samme nøkkel kan stå flere steder i brevet – varsle én gang per avvik.
    const avviksNokkel = `${nokkel}${innsattVerdi}`;
    if (rapportert.has(avviksNokkel)) return;
    rapportert.add(avviksNokkel);

    utdaterte.push({ nokkel, innsattVerdi, ferskVerdi });
  });

  return utdaterte;
};
