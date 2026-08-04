import { API_BASE_URL, BEHANDLINGER, PLACEHOLDERE } from "../api-constants";
import { getAsJson } from "../utils";

export interface PlaceholderVerdi {
  nokkel: string;
  verdi: string;
  // Forhåndsvalget står i verdi; kandidatlisten følger kun med når det er reelt flere å
  // velge mellom. Api-et leverer feltet først i runde 3.
  kandidater?: string[];
}

export interface PlaceholderBeskrivelse {
  nokkel: string;
  visningsnavn: string;
  beskrivelse: string;
  eksempel: string;
  sakstyper: string[];
}

// Ferdig beregnet fakta om saken. Api-et leverer feltet først i runde 5.
export interface Betingelse {
  nokkel: string;
  oppfylt: boolean;
}

export interface BetingelseBeskrivelse {
  nokkel: string;
  visningsnavn: string;
  beskrivelse: string;
  sakstyper: string[];
}

export const hentVerdier = (
  behandlingId: number,
): Promise<{ verdier: PlaceholderVerdi[]; betingelser?: Betingelse[] }> =>
  getAsJson(`${API_BASE_URL}${BEHANDLINGER}/${behandlingId}/placeholdere`);

// Api-et har levert sakstypene både som {kode, term}-objekter og som rene koder; begge former
// leses her så en revert på api-siden ikke tømmer sakstypene i web.
type SakstypeWire = string | { kode: string };

interface KatalogWire {
  placeholdere?: Array<Omit<PlaceholderBeskrivelse, "sakstyper"> & { sakstyper?: SakstypeWire[] }>;
  betingelser?: Array<Omit<BetingelseBeskrivelse, "sakstyper"> & { sakstyper?: SakstypeWire[] }>;
}

const sakstypeKoder = (sakstyper?: SakstypeWire[]): string[] =>
  (sakstyper ?? []).map((sakstype) => (typeof sakstype === "string" ? sakstype : sakstype.kode));

export const hentKatalog = async (): Promise<{
  placeholdere: PlaceholderBeskrivelse[];
  betingelser?: BetingelseBeskrivelse[];
}> => {
  const respons: KatalogWire = await getAsJson(`${API_BASE_URL}${PLACEHOLDERE}`);
  return {
    placeholdere: (respons.placeholdere ?? []).map((beskrivelse) => ({
      ...beskrivelse,
      sakstyper: sakstypeKoder(beskrivelse.sakstyper),
    })),
    betingelser: respons.betingelser?.map((beskrivelse) => ({
      ...beskrivelse,
      sakstyper: sakstypeKoder(beskrivelse.sakstyper),
    })),
  };
};

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

// I admin finnes ingen saksverdier å slå opp, så teksten over ville påstått at verdien mangler.
export const PLACEHOLDER_UERSTATTET_UTEN_VERDIER_TITTEL =
  "Erstattes automatisk ved innsetting fra Send brev dersom saken har en verdi – ellers fylles den ut manuelt";

export const PLACEHOLDER_UKJENT_TITTEL = "Ikke en gyldig placeholder – se katalogen over tilgjengelige placeholdere";

export const PLACEHOLDER_VALG_TITTEL = "Klikk for å velge mellom alternativene";

// Forhåndsvisningen er ikke klikkbar, så den kan ikke love et klikk.
export const PLACEHOLDER_VALG_TITTEL_VISNING = "Alternativet velges når teksten settes inn i brevet";

export const PLACEHOLDER_VALGT_TITTEL = "Klikk for å endre valget";

export const PLACEHOLDER_BETINGELSE_TITTEL =
  "Vises bare når betingelsen er oppfylt – løses ved innsetting fra Send brev";

// Nøkkelen inni {…}. Trimmes så «{ saksnummer }» ikke blir feilklassifisert som ukjent.
// Forhåndsvisningen leser HTML-strengen, der mellomrommet kan stå som &nbsp;-entitet, mens
// editoren ser U+00A0 som trim() tar. Entiteten dekodes her så begge veier gir samme nøkkel.
const nokkelFraToken = (token: string): string =>
  token
    .slice(1, -1)
    .replace(/&nbsp;/g, " ")
    .trim();

const VALG_PREFIKS = "{velg:";

// «velg:» er et reservert prefiks; nøkkelmønsteret tillater ikke kolon, så et valgtoken
// kolliderer aldri med en katalognøkkel.
const VALG_TOKEN_MONSTER = /^\{velg:[^{}<>\n]+\}$/;

// Alternativene i «A|B|C» – både fra tokenteksten og fra data-valg på et innsatt valg.
// Ett alternativ er ikke et valg, så da regnes strengen som ugyldig og gir tom liste.
// Duplikater slås sammen: to like knapper er ingen reell valgmulighet.
export const parseValgAlternativer = (alternativStreng: string): string[] => {
  const alternativer = [
    ...new Set(
      alternativStreng
        .split("|")
        .map((alternativ) => alternativ.trim())
        .filter(Boolean),
    ),
  ];
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

// «#hvis »/«/hvis» er reserverte tokenformer på linje med «velg:». Nøkkeldelen følger samme
// mønster som en katalognøkkel (ingen mellomrom, klammer, taggtegn eller |), så et
// betingelsestoken kan aldri kollidere med en vanlig nøkkel. Delt kilde for alle regexene
// som leser grammatikken – en justering ett sted kan ikke la de andre henge igjen.
const HVIS_NOKKEL = "[^{}<>\\s|:]+";
const HVIS_START_MONSTER = new RegExp(`^\\{#hvis\\s+(${HVIS_NOKKEL})\\}$`);

export const HVIS_SLUTT_TOKEN = "{/hvis}";

export const parseHvisStartToken = (token: string): { nokkel: string } | null => {
  const treff = HVIS_START_MONSTER.exec(token);
  return treff ? { nokkel: treff[1] } : null;
};

export const erHvisStartToken = (token: string): boolean => parseHvisStartToken(token) !== null;

export const erHvisSluttToken = (token: string): boolean => token === HVIS_SLUTT_TOKEN;

export const erBetingelsesToken = (token: string): boolean => erHvisStartToken(token) || erHvisSluttToken(token);

// Skiller gyldig-men-uten-verdi (gult) fra nøkkel som ikke finnes i katalogen (rødt).
// Uten liste – katalogen er ikke lastet, feilet eller er tom – kan vi ikke avgjøre
// gyldighet, og alt markeres gult som før.
export const erUkjentPlaceholder = (token: string, gyldigeNokler?: string[]): boolean => {
  // Valg- og betingelsestokener slås aldri opp i katalogen – de skal ikke kunne bli røde.
  if (erValgToken(token) || erBetingelsesToken(token)) return false;
  return Boolean(gyldigeNokler?.length) && !gyldigeNokler?.includes(nokkelFraToken(token));
};

// Trevegs-klassifiseringen av et token, delt av editoren og forhåndsvisningen så de to aldri
// kan markere ulikt. De reserverte tokenformene sjekkes først: «velg:» og «#hvis»/«/hvis» kan
// aldri bli røde. Tittelen hører til visningen og settes av kalleren.
export const markeringsklasseFor = (token: string, gyldigeNokler?: string[]): string => {
  if (erBetingelsesToken(token)) return "placeholder-betingelse";
  if (erValgToken(token)) return "placeholder-valg";
  return erUkjentPlaceholder(token, gyldigeNokler) ? "placeholder-ukjent" : "placeholder-uerstattet";
};

// Må speile MARKERINGSKLASSER i melosys-api service/.../tekstblokk/TekstblokkHtmlSanitizer.kt
export const PLACEHOLDER_MARKERINGSKLASSER = [
  "placeholder-uerstattet",
  "placeholder-ukjent",
  "placeholder-utfylt",
  "placeholder-valg",
  "placeholder-valgt",
  "placeholder-betingelse",
];

// bracketed-text er bevisst web-only – api-et pakker aldri ut klamme-spans, siden det ville
// endret innhold fra master-æraen ved lagring med togglen av.
export const ALLE_MARKERINGSKLASSER = [...PLACEHOLDER_MARKERINGSKLASSER, "bracketed-text"];

// Lagrede tekstblokker/brevmaler kan ha markerings-spans fra editoren bakt inn i innholdet.
// Uten opprydding nøstes markeringene ved gjenbruk – gul legger seg utenpå blå, og en
// utfylt verdi ser ut som om den mangler. Teksten beholdes, kun spanene fjernes.
// Med et klasse-utvalg beholdes de øvrige markeringene urørt.
export const fjernMarkeringsSpans = (html: string, klasser: string[] = ALLE_MARKERINGSKLASSER): string => {
  if (!ALLE_MARKERINGSKLASSER.some((klasse) => html.includes(klasse))) return html;

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
// Blokkelementene et token kan stå alene i. Er tokenet alene her, styrer det hele blokker;
// ellers avgjøres omfanget inne i blokken tokenene deler.
const BLOKKTAGGER = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "DIV", "TD", "TH", "BLOCKQUOTE", "PRE"]);

// Celler og listepunkter er strukturelle: fjernes de, kollapser tabellraden eller lista.
const CELLE_VELGER = "td,th,li";

interface TokenTreff {
  node: Text;
  index: number;
  token: string;
}

interface Par {
  start: TokenTreff;
  slutt: TokenTreff;
}

const finnBetingelsesTokener = (dokument: Document): TokenTreff[] => {
  const treff: TokenTreff[] = [];
  const vandrer = dokument.createTreeWalker(dokument.body, NodeFilter.SHOW_TEXT);

  for (let node = vandrer.nextNode() as Text | null; node !== null; node = vandrer.nextNode() as Text | null) {
    const regex = new RegExp(`\\{#hvis\\s+${HVIS_NOKKEL}\\}|\\{/hvis\\}`, "g");
    for (let match = regex.exec(node.data); match !== null; match = regex.exec(node.data)) {
      treff.push({ node, index: match.index, token: match[0] });
    }
  }

  return treff;
};

// Nesting og ubalanse gir null: da er omfanget tvetydig, og teksten skal stå urørt.
const parBetingelser = (treff: TokenTreff[]): Par[] | null => {
  const par: Par[] = [];
  let apen: TokenTreff | null = null;

  for (const token of treff) {
    if (erHvisSluttToken(token.token)) {
      if (apen === null) return null;
      par.push({ start: apen, slutt: token });
      apen = null;
    } else {
      if (apen !== null) return null;
      apen = token;
    }
  }

  return apen === null ? par : null;
};

const blokkFor = (node: Node): Element | null => {
  let element = node.parentElement;
  while (element !== null && !BLOKKTAGGER.has(element.tagName)) element = element.parentElement;
  return element;
};

// Blokkomfang krever at begge tokenene står alene i hver sin blokk under samme forelder.
const blokkOmfang = ({ start, slutt }: Par): { fra: Element; til: Element } | null => {
  const fra = blokkFor(start.node);
  const til = blokkFor(slutt.node);
  if (fra === null || til === null || fra.parentNode !== til.parentNode) return null;
  if (fra.textContent?.trim() !== start.token || til.textContent?.trim() !== slutt.token) return null;
  // Ulik celle eller listepunkt: å fjerne blokkene ville revet i stykker raden eller lista.
  if (fra.closest(CELLE_VELGER) !== til.closest(CELLE_VELGER)) return null;
  return { fra, til };
};

const fjernTokentekst = ({ node, index, token }: TokenTreff) => node.deleteData(index, token.length);

// Quill legger inn nbsp der et vanlig mellomrom ville kollapset, så begge må telle som mellomrom.
const erMellomrom = (tegn: string | undefined): boolean => tegn === " " || tegn === "\u00a0";

// Tokenene står som regel med mellomrom på hver side; uten dette blir det dobbelt igjen.
const fjernDobbeltMellomrom = ({ start, slutt }: Par) => {
  const bakIndeks = start.node === slutt.node ? start.index : 0;
  if (start.index === 0 || !erMellomrom(start.node.data[start.index - 1])) return;
  if (!erMellomrom(slutt.node.data[bakIndeks])) return;
  slutt.node.deleteData(bakIndeks, 1);
};

// Tokenene deler blokk, men ikke nødvendigvis tekstnode: en Range dekker også elementene mellom dem.
const losOppInline = (par: Par, oppfylt: boolean, dokument: Document) => {
  const { start, slutt } = par;
  if (oppfylt) {
    // Sluttet først: i en delt tekstnode ville fjerning av starten forskjøvet indeksen.
    fjernTokentekst(slutt);
    fjernTokentekst(start);
    return;
  }

  const spenn = dokument.createRange();
  spenn.setStart(start.node, start.index);
  spenn.setEnd(slutt.node, slutt.index + slutt.token.length);
  spenn.deleteContents();
  fjernDobbeltMellomrom(par);
};

const losOppBlokk = ({ fra, til }: { fra: Element; til: Element }, oppfylt: boolean) => {
  if (!oppfylt) {
    // nextSibling, ikke nextElementSibling: løs tekst mellom blokkene hører til grenen.
    for (let mellom = fra.nextSibling; mellom !== null && mellom !== til; ) {
      const neste = mellom.nextSibling;
      mellom.remove();
      mellom = neste;
    }
  }
  fra.remove();
  til.remove();
};

// Løser opp {#hvis nokkel}…{/hvis} mot sakens fakta. oppfylt=true beholder innholdet og
// fjerner tokenene, false fjerner begge deler. Ukjent nøkkel – og par uten entydig omfang –
// hoppes over hver for seg, så tokenene blir stående synlig markert mens resten løses.
export const losOppBetingelser = (html: string, betingelser?: Betingelse[]): string => {
  if (!html.includes("{#hvis") && !html.includes(HVIS_SLUTT_TOKEN)) return html;

  const dokument = new DOMParser().parseFromString(html, "text/html");
  const par = parBetingelser(finnBetingelsesTokener(dokument));
  if (par === null || par.length === 0) return html;

  const oppfyltForNokkel = new Map((betingelser ?? []).map(({ nokkel, oppfylt }) => [nokkel, oppfylt]));
  const oppgaver: Array<() => void> = [];

  for (const gjeldende of par) {
    const nokkel = parseHvisStartToken(gjeldende.start.token)?.nokkel ?? "";
    const oppfylt = oppfyltForNokkel.get(nokkel);
    if (oppfylt === undefined) continue;

    if (blokkFor(gjeldende.start.node) === blokkFor(gjeldende.slutt.node)) {
      oppgaver.push(() => losOppInline(gjeldende, oppfylt, dokument));
    } else {
      const omfang = blokkOmfang(gjeldende);
      // Kun dette paret hoppes over; å avlyse hele dokumentet ville låst de gyldige parene.
      if (omfang !== null) oppgaver.push(() => losOppBlokk(omfang, oppfylt));
    }
  }

  if (oppgaver.length === 0) return html;
  // Baklengs: flere par i samme tekstnode ville ellers fått indeksene forskjøvet.
  oppgaver.reverse().forEach((utfor) => utfor());
  return dokument.body.innerHTML;
};

// Delt av innsetting og forhåndsvisning, så de to aldri kan vise ulikt resultat. Innsettingen
// stripper alt (editoren remarkerer klammer tekstbasert), mens forhåndsvisningen ber om å få
// beholde lagrede klamme-spans – regexen der kan ikke gjenskape dem rundt inline-tagger.
export const forberedInnhold = (
  html: string,
  placeholderVerdier?: PlaceholderVerdi[],
  betingelser?: Betingelse[],
  klasserSomStrippes: string[] = ALLE_MARKERINGSKLASSER,
): string => {
  const rentHtml = losOppBetingelser(fjernMarkeringsSpans(html, klasserSomStrippes), betingelser);
  return placeholderVerdier ? erstattPlaceholdere(rentHtml, placeholderVerdier) : rentHtml;
};

// Løsere enn det strenge starttokenet, så et misformet «{#hvis to ord}» også fanges opp, men
// med samme <>\n-ekskludering som de andre tokenmønstrene: et treff som spente over en
// tagg-grense ville listet en HTML-blob i varselet.
const HVIS_START_LOST_MONSTER = /\{#hvis[^{}<>\n]*\}/g;
const HVIS_SLUTT_MONSTER = /\{\/hvis\}/g;

const HVIS_START_LITTERAL = "{#hvis";

// Foreldreløst = et {/hvis} som ikke har et gyldig starttoken foran seg i teksten. Balansen
// telles i dokumentrekkefølge, så både overskudd av {/hvis} og et reversert par fanges.
const harForeldreloseSlutt = (html: string, startIndekser: number[]): boolean => {
  const sluttIndekser = [...html.matchAll(HVIS_SLUTT_MONSTER)].map((treff) => treff.index);
  const hendelser = [
    ...startIndekser.map((index) => ({ index, erStart: true })),
    ...sluttIndekser.map((index) => ({ index, erStart: false })),
  ].sort((a, b) => a.index - b.index);

  let balanse = 0;
  for (const { erStart } of hendelser) {
    if (erStart) balanse += 1;
    else if (balanse === 0) return true;
    else balanse -= 1;
  }
  return false;
};

// Betingelsestokener som står igjen ved sending; de er styring og ville blitt sendt ordrett.
// Lista skal si hva som faktisk står i brevet: gyldige nøkler, et foreldreløst {/hvis},
// misformede starttokener ordrett, og «{#hvis» som markør for et uavsluttet fragment – de
// tre siste finnes ikke som nøkkel å slå opp.
export const finnUopplosteBetingelser = (html: string): string[] => {
  if (!html.includes(HVIS_START_LITTERAL) && !html.includes(HVIS_SLUTT_TOKEN)) return [];

  const nokler = new Set<string>();
  const misformede = new Set<string>();
  const startIndekser: number[] = [];
  let antallStartTreff = 0;

  for (const treff of html.matchAll(HVIS_START_LOST_MONSTER)) {
    antallStartTreff += 1;
    const nokkel = parseHvisStartToken(treff[0])?.nokkel;
    if (nokkel === undefined) misformede.add(treff[0]);
    else {
      nokler.add(nokkel);
      startIndekser.push(treff.index);
    }
  }

  // Flere «{#hvis» i teksten enn hele tokener betyr at minst ett aldri ble lukket.
  const uavsluttetFragment = html.split(HVIS_START_LITTERAL).length - 1 > antallStartTreff;

  return [
    ...nokler,
    ...(harForeldreloseSlutt(html, startIndekser) ? [HVIS_SLUTT_TOKEN] : []),
    ...misformede,
    ...(uavsluttetFragment ? [HVIS_START_LITTERAL] : []),
  ];
};

export interface SakstypeKonflikt {
  nokkel: string;
  visningsnavn: string;
  // Blokkens valgte sakstyper som placeholderen/betingelsen ikke dekker. Tom når blokken
  // gjelder alle sakstyper – da finnes ingen valgte å måle mot.
  sakstyper: string[];
  // Sakstypene placeholderen/betingelsen faktisk støtter.
  stottedeSakstyper: string[];
}

// Alle {…}-tokener i teksten, med betingelsesnøkkelen pakket ut av {#hvis …}.
const noklerITekst = (html: string): string[] => {
  const nokler = new Set<string>();
  for (const token of html.match(/\{[^{}<>]+\}/g) ?? []) {
    if (erValgToken(token)) continue;
    const hvis = parseHvisStartToken(token);
    if (hvis) nokler.add(hvis.nokkel);
    else if (!erBetingelsesToken(token)) nokler.add(nokkelFraToken(token));
  }
  return [...nokler];
};

// En blokk avgrenset til sakstyper kan bruke placeholdere som ikke finnes i alle sammen.
// Gjelder blokken alle sakstyper (tom valgteSakstyper), er enhver avgrenset placeholder
// verdt et varsel: den vil mangle i sakene utenfor listen.
export const finnSakstypeKonflikter = (
  html: string,
  valgteSakstyper: string[],
  katalog: PlaceholderBeskrivelse[] = [],
  betingelseKatalog: BetingelseBeskrivelse[] = [],
): SakstypeKonflikt[] => {
  const beskrivelser = new Map(
    [...katalog, ...betingelseKatalog].map(({ nokkel, visningsnavn, sakstyper }) => [
      nokkel,
      { visningsnavn, sakstyper },
    ]),
  );

  return noklerITekst(html).flatMap((nokkel) => {
    const beskrivelse = beskrivelser.get(nokkel);
    // Ukjent nøkkel markeres rødt i editoren, og tom sakstypeliste betyr «gjelder alle».
    if (!beskrivelse || beskrivelse.sakstyper.length === 0) return [];
    const udekkede = valgteSakstyper.filter((sakstype) => !beskrivelse.sakstyper.includes(sakstype));
    if (valgteSakstyper.length > 0 && udekkede.length === 0) return [];
    return [
      {
        nokkel,
        visningsnavn: beskrivelse.visningsnavn,
        sakstyper: udekkede,
        stottedeSakstyper: beskrivelse.sakstyper,
      },
    ];
  });
};

// Klammefelter saksbehandler skulle fylt ut selv. Delt fra token-varianten under fordi
// [felt]-konvensjonen er eldre enn placeholder-funksjonen og varsles uavhengig av toggle.
// Brukes kun til varsel ved sending – teksten endres aldri.
export const finnUutfylteKlammer = (html: string): string[] => {
  const uutfylte = new Set<string>();

  if (html.includes("bracketed-text")) {
    const dokument = new DOMParser().parseFromString(html, "text/html");
    dokument.body.querySelectorAll("span.bracketed-text").forEach((span) => {
      const tekst = span.textContent?.trim();
      if (tekst) uutfylte.add(tekst);
    });
  }

  // Samme tegnklasse som uthevKlammer, så treffet aldri går over en tagg-grense.
  for (const klammefelt of html.match(/\[[^[\]<>]*\]/g) ?? []) uutfylte.add(klammefelt);

  return [...uutfylte];
};

// Placeholder-tokener uten verdi, inkl. uvalgte {velg:…}. Varsles kun med placeholder-
// funksjonen på – vilkårlig {tekst} i et brev skal ikke gi varsel for alle.
export const finnUutfylteTokener = (html: string): string[] => {
  const uutfylte = new Set<string>();
  for (const token of html.match(/\{[^{}<>\n]+\}/g) ?? []) {
    // Betingelsestokener er styring, ikke felter – de varsles av finnUopplosteBetingelser.
    // Prefikssjekk, ikke erHvisStartToken: også et misformet «{#hvis to ord}» hører hjemme der.
    if (token.startsWith(HVIS_START_LITTERAL) || erHvisSluttToken(token)) continue;
    uutfylte.add(token);
  }
  return [...uutfylte];
};

export interface UtdatertPlaceholder {
  nokkel: string;
  innsattVerdi: string;
  ferskVerdi: string;
  // Verdien står fortsatt i kandidatlisten. Avviket kan være et bevisst valg, men like
  // gjerne et forhåndsvalg som senere endret seg – DOM-en skiller ikke de to, så varselet
  // vises uansett og formuleres mildere.
  fortsattKandidat: boolean;
}

// Billig sjekk på om teksten i det hele tatt har innsatte verdier å sammenligne.
export const harInnsatteVerdier = (html: string): boolean => html.includes("placeholder-utfylt");

// Innsatte verdier er frosset i brevteksten. Sammenligningen mot sakens ferske verdier
// gir grunnlag for å varsle ved sending – den endrer aldri teksten.
export const finnUtdaterteVerdier = (html: string, ferskeVerdier: PlaceholderVerdi[]): UtdatertPlaceholder[] => {
  if (!harInnsatteVerdier(html)) return [];

  const ferskForNokkel = new Map(ferskeVerdier.map((fersk) => [fersk.nokkel, fersk]));
  const dokument = new DOMParser().parseFromString(html, "text/html");
  const utdaterte: UtdatertPlaceholder[] = [];
  const rapportert = new Set<string>();

  dokument.body.querySelectorAll("span.placeholder-utfylt[data-placeholder]").forEach((span) => {
    const nokkel = span.getAttribute("data-placeholder") ?? "";
    const innsattVerdi = span.textContent ?? "";
    const fersk = ferskForNokkel.get(nokkel);
    // Nøkkel uten fersk verdi er utgått av registeret; den rapporteres med tom ferskVerdi.
    const ferskVerdi = fersk?.verdi ?? "";
    if (ferskVerdi === innsattVerdi) return;

    // Samme nøkkel kan stå flere steder i brevet – varsle én gang per avvik.
    const avviksNokkel = `${nokkel}${innsattVerdi}`;
    if (rapportert.has(avviksNokkel)) return;
    rapportert.add(avviksNokkel);

    utdaterte.push({
      nokkel,
      innsattVerdi,
      ferskVerdi,
      fortsattKandidat: fersk?.kandidater?.includes(innsattVerdi) ?? false,
    });
  });

  return utdaterte;
};
