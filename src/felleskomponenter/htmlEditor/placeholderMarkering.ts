import { Quill } from "react-quill-new";

import {
  erstattPlaceholdere,
  erUkjentPlaceholder,
  fjernMarkeringsSpans,
  PLACEHOLDER_UERSTATTET_TITTEL,
  PLACEHOLDER_UKJENT_TITTEL,
  PLACEHOLDER_UTFYLT_TITTEL,
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
// markeringene i innlimt/lagret innhold en rollback av togglen.
export const PLACEHOLDER_FORMATS = ["placeholder-utfylt", "placeholder-uerstattet", "placeholder-ukjent"];

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

// Strippes og påføres på nytt ved hver endring, siden markeringen utledes av teksten.
// Med gyldigeNokler skilles ukjente nøkler (rødt) fra gyldige uten verdi (gult).
export const markerUerstattedeOmrader = (quill: Quill, gyldigeNokler?: string[]) => {
  const tekst = quill.getText();
  const kanHaTreff = tekst.includes("{") && tekst.includes("}");
  // Klammefri tekst kan fortsatt ha markering igjen – f.eks. når brukeren nettopp slettet
  // klammene rundt en gulmarkert nøkkel – og den må strippes.
  if (!kanHaTreff && !quill.root.querySelector(".placeholder-uerstattet, .placeholder-ukjent")) return;

  quill.formatText(0, tekst.length, "placeholder-uerstattet", false);
  quill.formatText(0, tekst.length, "placeholder-ukjent", false);
  if (!kanHaTreff) return;

  finnUerstattedeOmrader(tekst).forEach(({ index, length }) => {
    const token = tekst.slice(index, index + length);
    const format = erUkjentPlaceholder(token, gyldigeNokler) ? "placeholder-ukjent" : "placeholder-uerstattet";
    quill.formatText(index, length, format, true);
  });
};

// «Rediger = overstyr»: PlaceholderBlot er et inline-format, så tekst brukeren skriver
// inntil eller inni en utfylt verdi havner inne i spanen. Avviker spanteksten fra den
// kjente verdien, er den redigert og markeringen skal bort. Uten verdier (andre editorer)
// kan vi ikke avgjøre gyldighet, og lar spanene stå urørt.
export const fjernUgyldigeUtfylteMarkeringer = (quill: Quill, verdier?: PlaceholderVerdi[]) => {
  if (!verdier?.length) return;

  const verdiForNokkel = new Map(verdier.map(({ nokkel, verdi }) => [nokkel, verdi]));
  const ugyldige: Array<{ index: number; length: number }> = [];

  quill.root.querySelectorAll<HTMLElement>("span.placeholder-utfylt").forEach((node) => {
    const nokkel = node.getAttribute("data-placeholder");
    const verdi = nokkel === null ? undefined : verdiForNokkel.get(nokkel);
    if (verdi === undefined || node.textContent === verdi) return;

    const blot = Quill.find(node);
    if (!blot || blot instanceof Quill) return;
    // Indeksene hentes før noe formateres, siden formatText ikke endrer tekstlengden.
    ugyldige.push({ index: quill.getIndex(blot), length: blot.length() });
  });

  ugyldige.forEach(({ index, length }) => quill.formatText(index, length, "placeholder-utfylt", false));
};

// HTML-en som går til dangerouslyPasteHTML ved innsetting av tekstblokk. Markeringer som
// ligger lagret i innholdet ryddes bort først; editoren markerer selv på nytt etterpå.
export const forberedTekstblokkHtml = (html: string, placeholderVerdier?: PlaceholderVerdi[]): string => {
  const rentHtml = fjernMarkeringsSpans(html);
  return placeholderVerdier ? erstattPlaceholdere(rentHtml, placeholderVerdier) : rentHtml;
};
