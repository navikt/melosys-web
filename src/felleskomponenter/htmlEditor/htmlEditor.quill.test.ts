import { describe, expect, it } from "vitest";
import { Quill } from "react-quill-new";

// Importeres for sideeffekten: HtmlEditor registrerer BracketBlot, placeholderMarkering
// registrerer de to placeholder-blotene.
import "./htmlEditor";
import { forberedTekstblokkHtml, markerUerstattedeOmrader } from "./placeholderMarkering";
import { PlaceholderVerdi } from "../../services/modules/placeholdere";

// Kjører en ekte Quill 2-instans med samme formats-liste og blots som HtmlEditor, slik
// at vi fanger opp det ren regex-testing ikke ser: at Parchment beholder markeringene.
const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "indent",
  "list",
  "bracketed",
  "placeholder-utfylt",
  "placeholder-uerstattet",
];

const lagEditor = () => {
  const node = document.createElement("div");
  document.body.appendChild(node);
  return new Quill(node, { formats: FORMATS });
};

const verdier: PlaceholderVerdi[] = [{ nokkel: "saksnummer", verdi: "2024/123456" }];

describe("HtmlEditor med ekte Quill", () => {
  it("beholder verdi og nøkkel når erstattet tekstblokk-HTML limes inn", () => {
    const quill = lagEditor();

    quill.clipboard.dangerouslyPasteHTML(0, forberedTekstblokkHtml("<p>Saken {saksnummer} er mottatt.</p>", verdier));

    expect(quill.root.innerHTML).toContain("2024/123456");
    expect(quill.root.innerHTML).toContain('data-placeholder="saksnummer"');
    expect(quill.getText()).not.toContain("{saksnummer}");
  });

  it("markerer uerstattet placeholder uten å røre klammemarkeringen", () => {
    const quill = lagEditor();
    quill.setText("Se [KLAMME] og {nokkel} her\n");
    quill.formatText(3, 8, "bracketed", true);

    markerUerstattedeOmrader(quill);

    expect(quill.root.innerHTML).toContain('<span class="bracketed-text">[KLAMME]</span>');
    expect(quill.root.innerHTML).toContain('<span class="placeholder-uerstattet">{nokkel}</span>');
    expect(quill.getFormat(15, 8)).toEqual({ "placeholder-uerstattet": true });
    expect(quill.getFormat(3, 8)).toEqual({ bracketed: true });
  });

  it("lar {nokkel} med tom verdi bli stående og gulmarkerer den", () => {
    const quill = lagEditor();

    quill.clipboard.dangerouslyPasteHTML(
      0,
      forberedTekstblokkHtml("<p>Hei {navn}.</p>", [{ nokkel: "navn", verdi: "" }]),
    );
    markerUerstattedeOmrader(quill);

    expect(quill.getText()).toContain("{navn}");
    expect(quill.root.innerHTML).toContain('<span class="placeholder-uerstattet">{navn}</span>');
  });

  it("markerer ikke over avsnittsgrenser når klammene står uparet på hver sin linje", () => {
    const quill = lagEditor();
    quill.setText("Et { her\nog et } der\n");

    markerUerstattedeOmrader(quill);

    expect(quill.root.innerHTML).not.toContain("placeholder-uerstattet");
  });
});
