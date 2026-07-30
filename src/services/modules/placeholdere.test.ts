import { describe, expect, it } from "vitest";

import { erstattPlaceholdere, finnUtdaterteVerdier, fjernMarkeringsSpans, PlaceholderVerdi } from "./placeholdere";

const verdier: PlaceholderVerdi[] = [
  { nokkel: "saksnummer", verdi: "2024/123456" },
  { nokkel: "dagens-dato", verdi: "30.07.2026" },
];

describe("erstattPlaceholdere", () => {
  it("erstatter kjent nøkkel med verdi pakket i markerings-span", () => {
    const resultat = erstattPlaceholdere("<p>Saken {saksnummer} er mottatt.</p>", verdier);
    expect(resultat).toBe(
      '<p>Saken <span class="placeholder-utfylt" data-placeholder="saksnummer" ' +
        'title="Fylt inn automatisk fra saken (saksnummer)">2024/123456</span> er mottatt.</p>',
    );
  });

  it("forklarer markeringen med en tooltip som navngir nøkkelen", () => {
    const resultat = erstattPlaceholdere("<p>{dagens-dato}</p>", verdier);
    expect(resultat).toContain('title="Fylt inn automatisk fra saken (dagens-dato)"');
  });

  it("escaper nøkkelen også i tooltipen", () => {
    const resultat = erstattPlaceholdere('<p>{a"b}</p>', [{ nokkel: 'a"b', verdi: "X" }]);
    expect(resultat).toContain('title="Fylt inn automatisk fra saken (a&quot;b)"');
  });

  it("lar ukjent nøkkel stå urørt", () => {
    const html = "<p>Hei {fornavn}, saken gjelder {saksnummer}.</p>";
    const resultat = erstattPlaceholdere(html, verdier);
    expect(resultat).toContain("{fornavn}");
    expect(resultat).toContain('data-placeholder="saksnummer"');
  });

  it("rører ikke tekst i klammer", () => {
    const html = "<p>[SAKSNUMMER] og {saksnummer}</p>";
    const resultat = erstattPlaceholdere(html, verdier);
    expect(resultat).toContain("[SAKSNUMMER]");
    expect(resultat).not.toContain("{saksnummer}");
  });

  it("erstatter ikke over tag-grenser", () => {
    const html = "<p>{saks<strong>nummer}</strong></p>";
    expect(erstattPlaceholdere(html, verdier)).toBe(html);
  });

  it("erstatter flere forekomster av samme nøkkel", () => {
    const resultat = erstattPlaceholdere("<p>{dagens-dato} og igjen {dagens-dato}</p>", verdier);
    expect(resultat.match(/30\.07\.2026/g)).toHaveLength(2);
  });

  it("returnerer HTML uendret ved tom verdiliste", () => {
    const html = "<p>{saksnummer}</p>";
    expect(erstattPlaceholdere(html, [])).toBe(html);
  });

  it("lar nøkkel med tom verdi stå urørt", () => {
    const html = "<p>Hei {navn}.</p>";
    expect(erstattPlaceholdere(html, [{ nokkel: "navn", verdi: "" }])).toBe(html);
  });

  it("HTML-escaper verdien før innsetting i markup", () => {
    const resultat = erstattPlaceholdere("<p>{navn}</p>", [{ nokkel: "navn", verdi: 'A <B> & "C"' }]);
    expect(resultat).toContain("A &lt;B&gt; &amp; &quot;C&quot;");
    expect(resultat).not.toContain("<B>");
  });
});

describe("fjernMarkeringsSpans", () => {
  it("pakker ut uerstattet-markering som ligger lagret i innholdet", () => {
    const html = '<p><span class="placeholder-uerstattet">{saksnummer}</span></p>';
    expect(fjernMarkeringsSpans(html)).toBe("<p>{saksnummer}</p>");
  });

  it("pakker ut dobbeltnøstede klammemarkeringer til én ren tekst", () => {
    const html = '<p><span class="bracketed-text"><span class="bracketed-text">[dato]</span></span></p>';
    expect(fjernMarkeringsSpans(html)).toBe("<p>[dato]</p>");
  });

  it("gjør lagret markering erstattbar igjen i stedet for nøstet", () => {
    const html = '<p>Saken <span class="placeholder-uerstattet">{saksnummer}</span> er mottatt.</p>';
    const resultat = erstattPlaceholdere(fjernMarkeringsSpans(html), verdier);
    expect(resultat).toContain('<span class="placeholder-utfylt" data-placeholder="saksnummer"');
    expect(resultat).not.toContain("placeholder-uerstattet");
  });

  it("beholder annen markup og lar HTML uten markeringer stå urørt", () => {
    const html = "<p>Saken <strong>{saksnummer}</strong> er mottatt.</p>";
    expect(fjernMarkeringsSpans(html)).toBe(html);
  });
});

describe("finnUtdaterteVerdier", () => {
  const utfylt = (nokkel: string, verdi: string) =>
    `<span class="placeholder-utfylt" data-placeholder="${nokkel}">${verdi}</span>`;

  it("rapporterer innsatt verdi som avviker fra fersk verdi", () => {
    const html = `<p>Saken ${utfylt("saksnummer", "MEL-21")} er mottatt.</p>`;
    expect(finnUtdaterteVerdier(html, [{ nokkel: "saksnummer", verdi: "MEL-22" }])).toEqual([
      { nokkel: "saksnummer", innsattVerdi: "MEL-21", ferskVerdi: "MEL-22" },
    ]);
  });

  it("rapporterer ikke identiske verdier", () => {
    const html = `<p>${utfylt("saksnummer", "2024/123456")}</p>`;
    expect(finnUtdaterteVerdier(html, verdier)).toEqual([]);
  });

  it("rapporterer nøkkel uten fersk verdi med tom ferskVerdi", () => {
    const html = `<p>${utfylt("utgaatt-nokkel", "Gammel verdi")}</p>`;
    expect(finnUtdaterteVerdier(html, verdier)).toEqual([
      { nokkel: "utgaatt-nokkel", innsattVerdi: "Gammel verdi", ferskVerdi: "" },
    ]);
  });

  it("returnerer tom liste for tom HTML", () => {
    expect(finnUtdaterteVerdier("", verdier)).toEqual([]);
  });

  it("ignorerer markerings-span uten data-placeholder", () => {
    const html = '<p><span class="placeholder-utfylt">MEL-21</span></p>';
    expect(finnUtdaterteVerdier(html, [{ nokkel: "saksnummer", verdi: "MEL-22" }])).toEqual([]);
  });

  it("rapporterer samme avvik én gang selv om nøkkelen står flere steder", () => {
    const html = `<p>${utfylt("saksnummer", "MEL-21")}</p><p>${utfylt("saksnummer", "MEL-21")}</p>`;
    expect(finnUtdaterteVerdier(html, [{ nokkel: "saksnummer", verdi: "MEL-22" }])).toHaveLength(1);
  });

  it("rapporterer flere ulike nøkler i rekkefølgen de står i brevet", () => {
    const html = `<p>${utfylt("saksnummer", "MEL-21")} ${utfylt("dagens-dato", "01.01.2020")}</p>`;
    expect(finnUtdaterteVerdier(html, verdier).map(({ nokkel }) => nokkel)).toEqual(["saksnummer", "dagens-dato"]);
  });
});
