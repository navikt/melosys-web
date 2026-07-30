import { Quill } from "react-quill-new";

import { erstattPlaceholdere, PlaceholderVerdi } from "../../services/modules/placeholdere";

const Inline = Quill.import("blots/inline") as any;

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

  static formats() {
    return true;
  }
}

Quill.register("formats/placeholder-uerstattet", PlaceholderUerstattetBlot);

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
export const markerUerstattedeOmrader = (quill: Quill) => {
  const tekst = quill.getText();
  // Uten klammer i teksten finnes verken markering å strippe eller å påføre.
  if (!tekst.includes("{") && !tekst.includes("}")) return;

  quill.formatText(0, tekst.length, "placeholder-uerstattet", false);
  finnUerstattedeOmrader(tekst).forEach(({ index, length }) => {
    quill.formatText(index, length, "placeholder-uerstattet", true);
  });
};

// HTML-en som går til dangerouslyPasteHTML ved innsetting av tekstblokk. Uten verdier
// (toggle av / manglende data) er den urørt.
export const forberedTekstblokkHtml = (html: string, placeholderVerdier?: PlaceholderVerdi[]): string =>
  placeholderVerdier ? erstattPlaceholdere(html, placeholderVerdier) : html;
