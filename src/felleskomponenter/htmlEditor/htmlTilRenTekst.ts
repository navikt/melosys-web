// Tekstblokkene er HTML, men utklippstavla brukes til å lime inn i saksflyter som ikke
// har en rik editor. Derfor ren tekst: blokkstrukturen oversettes til linjeskift i
// stedet for å gå tapt, og tokener som {navn} eller {#hvis …} står urørt – mottakeren
// må uansett fylle dem ut manuelt.

const BLOKKTAGGER = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "TR", "BLOCKQUOTE", "PRE"]);

const tekstFra = (node: Node, deler: string[]): void => {
  if (node.nodeType === Node.TEXT_NODE) {
    deler.push(node.textContent ?? "");
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const element = node as Element;
  if (element.tagName === "BR") {
    deler.push("\n");
    return;
  }

  // Punkter står tett, ikke som avsnitt, og trenger en markør siden ren tekst ikke
  // har lister. Derfor eget tilfelle: linjeskift kun foran, aldri en tom linje mellom.
  if (element.tagName === "LI") {
    deler.push("\n- ");
    element.childNodes.forEach((barn) => tekstFra(barn, deler));
    return;
  }

  const erBlokk = BLOKKTAGGER.has(element.tagName);
  if (erBlokk) deler.push("\n");

  element.childNodes.forEach((barn) => tekstFra(barn, deler));

  if (erBlokk) deler.push("\n");
};

export const htmlTilRenTekst = (html: string): string => {
  const dokument = new DOMParser().parseFromString(html, "text/html");
  const deler: string[] = [];
  dokument.body.childNodes.forEach((node) => tekstFra(node, deler));

  return (
    deler
      .join("")
      // Harde mellomrom er et HTML-virkemiddel og har ingen verdi i ren tekst.
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      // Ett tomt skille mellom avsnitt er nok; blokktaggene gir fort flere på rad.
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
};

export default htmlTilRenTekst;
