import { describe, expect, it } from "vitest";

import { forberedTekstblokkHtml, PlaceholderBlot } from "./htmlEditor";
import { PlaceholderVerdi } from "../../services/modules/placeholdere";

const verdier: PlaceholderVerdi[] = [{ nokkel: "saksnummer", verdi: "2024/123456" }];

describe("forberedTekstblokkHtml", () => {
  it("erstatter placeholdere i HTML-en som limes inn ved innsetting av tekstblokk", () => {
    const resultat = forberedTekstblokkHtml("<p>Saken {saksnummer} er mottatt.</p>", verdier);
    expect(resultat).toContain("2024/123456");
    expect(resultat).toContain('data-placeholder="saksnummer"');
    expect(resultat).not.toContain("{saksnummer}");
  });

  it("lar HTML-en stå urørt uten verdier (toggle av / manglende data)", () => {
    const html = "<p>Saken {saksnummer} er mottatt.</p>";
    expect(forberedTekstblokkHtml(html, undefined)).toBe(html);
  });
});

describe("PlaceholderBlot", () => {
  it("formats leser nøkkelen fra data-attributtet", () => {
    const node = document.createElement("span");
    node.setAttribute("data-placeholder", "saksnummer");
    expect(PlaceholderBlot.formats(node)).toBe("saksnummer");
  });

  it("create setter klasse og data-attributt med nøkkelen", () => {
    const node = PlaceholderBlot.create("dagens-dato") as HTMLElement;
    expect(node.tagName).toBe("SPAN");
    expect(node.classList.contains("placeholder-utfylt")).toBe(true);
    expect(node.getAttribute("data-placeholder")).toBe("dagens-dato");
  });
});
