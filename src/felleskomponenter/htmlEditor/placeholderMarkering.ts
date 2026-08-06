import { Quill } from "react-quill-new";

import {
  Betingelse,
  forberedInnhold,
  markeringsklasseFor,
  parseValgAlternativer,
  PLACEHOLDER_BETINGELSE_TITTEL,
  PLACEHOLDER_UERSTATTET_TITTEL,
  PLACEHOLDER_UERSTATTET_UTEN_VERDIER_TITTEL,
  PLACEHOLDER_UKJENT_TITTEL,
  PLACEHOLDER_UTFYLT_TITTEL,
  PLACEHOLDER_VALG_TITTEL,
  PLACEHOLDER_VALGT_TITTEL,
  PlaceholderVerdi,
} from "../../services/modules/placeholdere";

const Inline = Quill.import("blots/inline") as any;

// Formats-whitelisten HtmlEditor gir Quill. Bor her så testene kan kjøre på selve
// produksjonslisten i stedet for en kopi som driver ut av sync.
export const EDITOR_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "indent",
  "list",
  "table",
  "bracketed",
  "break",
];

// Legges til kun når dynamisk placeholder-toggle er på. Er de med uansett, overlever
// markeringene i innlimt og lagret innhold at togglen slås av.
export const PLACEHOLDER_FORMATS = [
  "placeholder-utfylt",
  "placeholder-uerstattet",
  "placeholder-ukjent",
  "placeholder-valg",
  "placeholder-valgt",
  "placeholder-betingelse",
];

// Markerer tekst i klammer. Bor sammen med placeholder-blotene fordi alle deler tagName
// span og må registreres før første Quill-instans lages.
export class BracketBlot extends Inline {
  static blotName = "bracketed";

  static tagName = "span";

  static create() {
    const node = super.create();
    node.classList.add("bracketed-text");
    return node;
  }

  static formats() {
    return true;
  }
}

Quill.register("formats/bracketed", BracketBlot);

// Markerer utfylte placeholder-verdier. Deler tagName med BracketBlot, så className er
// nødvendig for at Parchment skal skille dem. Nøkkelen bæres i data-attributtet slik at
// markeringen overlever innliming mellom felter.
export class PlaceholderBlot extends Inline {
  static blotName = "placeholder-utfylt";

  static tagName = "span";

  static className = "placeholder-utfylt";

  static create(value: string) {
    const node = super.create();
    node.setAttribute("data-placeholder", value);
    // Settes her og ikke bare i erstattPlaceholdere, så tooltipen overlever Quills normalisering.
    node.setAttribute("title", PLACEHOLDER_UTFYLT_TITTEL(value));
    return node;
  }

  static formats(node: HTMLElement) {
    return node.getAttribute("data-placeholder");
  }
}

Quill.register("formats/placeholder-utfylt", PlaceholderBlot);

// Markerer placeholdere som står igjen uerstattet. Boolsk som BracketBlot: markeringen
// utledes av selve klammeteksten på hver text-change, så den trenger ingen verdi.
export class PlaceholderUerstattetBlot extends Inline {
  static blotName = "placeholder-uerstattet";

  static tagName = "span";

  static className = "placeholder-uerstattet";

  static create() {
    const node = super.create();
    node.setAttribute("title", PLACEHOLDER_UERSTATTET_TITTEL);
    return node;
  }

  static formats() {
    return true;
  }
}

Quill.register("formats/placeholder-uerstattet", PlaceholderUerstattetBlot);

// Markerer nøkler som ikke finnes i placeholder-katalogen. Boolsk som blotet over:
// klassifiseringen gjøres på nytt fra teksten ved hver endring.
export class PlaceholderUkjentBlot extends Inline {
  static blotName = "placeholder-ukjent";

  static tagName = "span";

  static className = "placeholder-ukjent";

  static create() {
    const node = super.create();
    node.setAttribute("title", PLACEHOLDER_UKJENT_TITTEL);
    return node;
  }

  static formats() {
    return true;
  }
}

Quill.register("formats/placeholder-ukjent", PlaceholderUkjentBlot);

// Markerer et uvalgt {velg:A|B|C}. Boolsk som blotene over: alternativene står i
// klammeteksten, så markeringen utledes på nytt ved hver endring.
export class PlaceholderValgBlot extends Inline {
  static blotName = "placeholder-valg";

  static tagName = "span";

  static className = "placeholder-valg";

  static create() {
    const node = super.create();
    node.setAttribute("title", PLACEHOLDER_VALG_TITTEL);
    return node;
  }

  static formats() {
    return true;
  }
}

Quill.register("formats/placeholder-valg", PlaceholderValgBlot);

// Markerer et innsatt valg. Teksten er det valgte alternativet alene, så markeringen kan
// ikke utledes av teksten – alternativlisten bæres i data-valg slik at et nytt klikk kan
// åpne samme valg igjen.
export class PlaceholderValgtBlot extends Inline {
  static blotName = "placeholder-valgt";

  static tagName = "span";

  static className = "placeholder-valgt";

  static create(value: string) {
    const node = super.create();
    node.setAttribute("data-valg", value);
    node.setAttribute("title", PLACEHOLDER_VALGT_TITTEL);
    return node;
  }

  static formats(node: HTMLElement) {
    return node.getAttribute("data-valg");
  }
}

Quill.register("formats/placeholder-valgt", PlaceholderValgtBlot);

// Markerer {#hvis nokkel}/{/hvis}. Boolsk og tekstdrevet som de andre tokenmarkeringene:
// omfanget avgjøres først ved innsetting, så markeringen bærer ingen identitet selv.
export class PlaceholderBetingelseBlot extends Inline {
  static blotName = "placeholder-betingelse";

  static tagName = "span";

  static className = "placeholder-betingelse";

  static create() {
    const node = super.create();
    node.setAttribute("title", PLACEHOLDER_BETINGELSE_TITTEL);
    return node;
  }

  static formats() {
    return true;
  }
}

Quill.register("formats/placeholder-betingelse", PlaceholderBetingelseBlot);

// Utfylte verdier har ingen klammer igjen i teksten og treffes derfor aldri.
// \n er utelatt fra tegnklassen så en uparet { ikke slår seg sammen med en } lenger
// nede i teksten og gulfarger alt imellom.
export const finnUerstattedeOmrader = (tekst: string): Array<{ index: number; length: number }> => {
  const regex = /\{[^{}\n]+\}/g;
  const omrader: Array<{ index: number; length: number }> = [];

  let treff: RegExpExecArray | null = regex.exec(tekst);
  while (treff !== null) {
    omrader.push({ index: treff.index, length: treff[0].length });
    treff = regex.exec(tekst);
  }

  return omrader;
};

// Blotet setter én fast title i create(); her rettes den etter konteksten editoren står i.
const settUerstattetTittel = (quill: Quill, harVerdikontekst: boolean) => {
  const tittel = harVerdikontekst ? PLACEHOLDER_UERSTATTET_TITTEL : PLACEHOLDER_UERSTATTET_UTEN_VERDIER_TITTEL;
  quill.root.querySelectorAll("span.placeholder-uerstattet").forEach((node) => {
    // Bare ved faktisk avvik: en setAttribute med samme verdi ville gitt Quill en ny mutasjon å behandle.
    if (node.getAttribute("title") !== tittel) node.setAttribute("title", tittel);
  });
};

// Strippes og påføres på nytt ved hver endring, siden markeringen utledes av teksten.
// Med gyldigeNokler skilles ukjente nøkler (rødt) fra gyldige uten verdi (gult), og med
// gyldigeBetingelsesNokler blir en feilstavet {#hvis …} rød i stedet for å se gyldig ut.
// placeholder-valgt er ikke med: den bæres av formatet, ikke av teksten.
// harVerdikontekst forteller om verten kan levere saksverdier (Send brev), og styrer
// tooltipen på de gule markeringene.
export const markerUerstattedeOmrader = (
  quill: Quill,
  gyldigeNokler?: string[],
  harVerdikontekst = false,
  gyldigeBetingelsesNokler?: string[],
) => {
  const tekst = quill.getText();
  const kanHaTreff = tekst.includes("{") && tekst.includes("}");
  // Klammefri tekst kan fortsatt ha markering igjen – f.eks. når brukeren nettopp slettet
  // klammene rundt en gulmarkert nøkkel – og den må strippes.
  if (
    !kanHaTreff &&
    !quill.root.querySelector(
      ".placeholder-uerstattet, .placeholder-ukjent, .placeholder-valg, .placeholder-betingelse",
    )
  )
    return;

  // Ett pass over hele teksten: fire separate formatText-kall ville gitt fire Delta-er per tastetrykk.
  quill.formatText(0, tekst.length, {
    "placeholder-uerstattet": false,
    "placeholder-ukjent": false,
    "placeholder-valg": false,
    "placeholder-betingelse": false,
  });
  if (!kanHaTreff) return;

  finnUerstattedeOmrader(tekst).forEach(({ index, length }) => {
    const format = markeringsklasseFor(tekst.slice(index, index + length), gyldigeNokler, gyldigeBetingelsesNokler);
    quill.formatText(index, length, format, true);
  });

  settUerstattetTittel(quill, harVerdikontekst);
};

// «Rediger = overstyr»: PlaceholderBlot er et inline-format, så tekst brukeren skriver
// inntil eller inni en utfylt verdi havner inne i spanen. Avviker spanteksten fra den
// kjente verdien, er den redigert og markeringen skal bort. Uten verdier (andre editorer)
// kan vi ikke avgjøre gyldighet, og lar spanene stå urørt.
export const fjernUgyldigeUtfylteMarkeringer = (quill: Quill, verdier?: PlaceholderVerdi[]) => {
  if (!verdier?.length) return;

  const verdiForNokkel = new Map(verdier.map((verdi) => [verdi.nokkel, verdi]));
  const ugyldige: Array<{ index: number; length: number }> = [];

  quill.root.querySelectorAll<HTMLElement>("span.placeholder-utfylt").forEach((node) => {
    const nokkel = node.getAttribute("data-placeholder");
    const kjent = nokkel === null ? undefined : verdiForNokkel.get(nokkel);
    const tekst = node.textContent ?? "";
    // En valgt kandidat er like gyldig som forhåndsvalget, ellers ville markeringen falt
    // bort i samme øyeblikk som saksbehandleren byttet verdi.
    if (kjent === undefined || tekst === kjent.verdi || kjent.kandidater?.includes(tekst)) return;

    const blot = Quill.find(node);
    if (!blot || blot instanceof Quill) return;
    // Indeksene hentes før noe formateres, siden formatText ikke endrer tekstlengden.
    ugyldige.push({ index: quill.getIndex(blot), length: blot.length() });
  });

  ugyldige.forEach(({ index, length }) => quill.formatText(index, length, "placeholder-utfylt", false));
};

// Samme «rediger = overstyr» for innsatte valg: står ikke spanteksten lenger blant
// alternativene i data-valg, har brukeren skrevet i den og markeringen skal bort.
export const fjernUgyldigeValgteMarkeringer = (quill: Quill) => {
  const ugyldige: Array<{ index: number; length: number }> = [];

  quill.root.querySelectorAll<HTMLElement>("span.placeholder-valgt[data-valg]").forEach((node) => {
    const alternativer = parseValgAlternativer(node.getAttribute("data-valg") ?? "");
    if (alternativer.includes(node.textContent ?? "")) return;

    const blot = Quill.find(node);
    if (!blot || blot instanceof Quill) return;
    ugyldige.push({ index: quill.getIndex(blot), length: blot.length() });
  });

  ugyldige.forEach(({ index, length }) => quill.formatText(index, length, "placeholder-valgt", false));
};

// HTML-en som går til dangerouslyPasteHTML ved innsetting av tekstblokk.
export const forberedTekstblokkHtml = (
  html: string,
  placeholderVerdier?: PlaceholderVerdi[],
  betingelser?: Betingelse[],
): string => forberedInnhold(html, placeholderVerdier, betingelser);
