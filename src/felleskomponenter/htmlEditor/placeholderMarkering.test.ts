import { describe, expect, it } from "vitest";

import {
  finnUerstattedeOmrader,
  forberedTekstblokkHtml,
  PlaceholderBlot,
  PlaceholderUerstattetBlot,
  PlaceholderUkjentBlot,
} from "./placeholderMarkering";
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

  it("create setter tooltip som navngir nøkkelen", () => {
    const node = PlaceholderBlot.create("saksnummer") as HTMLElement;
    expect(node.getAttribute("title")).toBe("Fylt inn automatisk fra saken (saksnummer)");
  });
});

describe("finnUerstattedeOmrader", () => {
  it("treffer en uerstattet placeholder", () => {
    expect(finnUerstattedeOmrader("Saken {saksnummer} er mottatt.")).toEqual([{ index: 6, length: 12 }]);
  });

  it("treffer flere placeholdere i samme tekst", () => {
    const omrader = finnUerstattedeOmrader("{fornavn} {etternavn}");
    expect(omrader).toEqual([
      { index: 0, length: 9 },
      { index: 10, length: 11 },
    ]);
  });

  it("treffer ikke tomme klammer", () => {
    expect(finnUerstattedeOmrader("Et {} her")).toEqual([]);
  });

  it("treffer ikke tekst i firkantklammer", () => {
    expect(finnUerstattedeOmrader("Et [PLACEHOLDER] her")).toEqual([]);
  });

  it("treffer ikke tekst uten klammer", () => {
    expect(finnUerstattedeOmrader("Saken 2024/123456 er mottatt.")).toEqual([]);
  });

  it("treffer ikke over avsnittsgrenser når klammene står uparet på hver sin linje", () => {
    expect(finnUerstattedeOmrader("Et { her\nog et } der")).toEqual([]);
  });
});

describe("PlaceholderUerstattetBlot", () => {
  it("create setter klassen", () => {
    const node = PlaceholderUerstattetBlot.create() as HTMLElement;
    expect(node.tagName).toBe("SPAN");
    expect(node.classList.contains("placeholder-uerstattet")).toBe(true);
  });

  it("create setter tooltip som forklarer at verdien mangler", () => {
    const node = PlaceholderUerstattetBlot.create() as HTMLElement;
    expect(node.getAttribute("title")).toContain("Ingen verdi tilgjengelig");
    expect(node.getAttribute("title")).toContain("Send brev");
  });

  it("formats returnerer true", () => {
    expect(PlaceholderUerstattetBlot.formats()).toBe(true);
  });
});

describe("PlaceholderUkjentBlot", () => {
  it("create setter klassen", () => {
    const node = PlaceholderUkjentBlot.create() as HTMLElement;
    expect(node.tagName).toBe("SPAN");
    expect(node.classList.contains("placeholder-ukjent")).toBe(true);
  });

  it("create setter tooltip som viser til katalogen", () => {
    const node = PlaceholderUkjentBlot.create() as HTMLElement;
    expect(node.getAttribute("title")).toContain("Ikke en gyldig placeholder");
    expect(node.getAttribute("title")).toContain("katalogen");
  });

  it("formats returnerer true", () => {
    expect(PlaceholderUkjentBlot.formats()).toBe(true);
  });
});
