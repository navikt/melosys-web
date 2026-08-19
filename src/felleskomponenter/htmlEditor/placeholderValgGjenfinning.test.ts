import { describe, expect, it } from "vitest";
import { Quill } from "react-quill-new";

// Importeres for sideeffekten: placeholderMarkering registrerer klamme- og placeholder-blotene.
import "./htmlEditor";
import { EDITOR_FORMATS, markerUerstattedeOmrader, PLACEHOLDER_FORMATS } from "./placeholderMarkering";
import { ferskPosisjon, finnPlaceholderTreff, naermestePosisjon } from "./placeholderValg";

const lagEditor = () => {
  const node = document.createElement("div");
  document.body.appendChild(node);
  return new Quill(node, { formats: [...EDITOR_FORMATS, ...PLACEHOLDER_FORMATS] });
};

const treffFor = (quill: Quill, velger: string) => {
  const treff = finnPlaceholderTreff(quill, quill.root.querySelector(velger));
  if (!treff) throw new Error(`Fant ingen valgtreff for ${velger}`);
  return treff;
};

// Popoveren kan stå åpen gjennom en redigering, så markeringen må gjenfinnes etterpå.
describe("Gjenfinning av et treff etter redigering", () => {
  // Med to like tokener skiller hverken tekst eller markering dem, og den første i DOM-en
  // er som regel feil.
  it("velger tokenet nærmest der treffet ble åpnet når to like står i teksten", () => {
    const quill = lagEditor();
    quill.setText("A {velg:Ja|Nei} og B {velg:Ja|Nei}\n");
    markerUerstattedeOmrader(quill);
    const kandidater = Array.from(quill.root.querySelectorAll<HTMLElement>("span.placeholder-valg")).map((span) => {
      const treff = finnPlaceholderTreff(quill, span);
      if (!treff) throw new Error("Fant ingen valgtreff");
      return treff;
    });
    const [forste, andre] = kandidater;

    expect(naermestePosisjon(kandidater, andre.index - 1)?.index).toBe(andre.index);
    expect(naermestePosisjon(kandidater, forste.index + 1)?.index).toBe(forste.index);
  });

  // Avstandsheuristikken alene ville plukket det andre tokenet her: den foreldede indeksen
  // ligger nærmest det etter at teksten foran ble slettet. Spanen brukeren åpnet står urørt.
  it("holder på tokenet brukeren åpnet når en redigering foran flytter begge", () => {
    const quill = lagEditor();
    quill.setText(`${"P".repeat(30)}{velg:Ja|Nei}Q{velg:Ja|Nei}\n`);
    markerUerstattedeOmrader(quill);
    const treff = treffFor(quill, "span.placeholder-valg");
    expect(treff.index).toBe(30);

    quill.deleteText(0, 28, "user");

    expect(ferskPosisjon(quill, treff)?.index).toBe(2);
  });

  it("faller tilbake til nærmeste token når spanen brukeren åpnet er borte", () => {
    const quill = lagEditor();
    quill.setText("A {velg:Ja|Nei} og B {velg:Ja|Nei}\n");
    markerUerstattedeOmrader(quill);
    const treff = treffFor(quill, "span.placeholder-valg:last-of-type");

    // Remarkering bytter ut DOM-noden; da finnes bare posisjonen å kjenne markeringen på.
    treff.span.remove();

    expect(ferskPosisjon(quill, treff)?.index).toBe(treff.index);
  });
});
