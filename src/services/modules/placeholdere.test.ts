import { describe, expect, it } from "vitest";

import {
  erstattPlaceholdere,
  erUkjentPlaceholder,
  erValgToken,
  finnUtdaterteVerdier,
  fjernMarkeringsSpans,
  parseValgAlternativer,
  parseValgToken,
  PLACEHOLDER_MARKERINGSKLASSER,
  PlaceholderVerdi,
} from "./placeholdere";

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

  it("erstatter nøkkel med luft rundt seg, som erUkjentPlaceholder regner som gyldig", () => {
    const resultat = erstattPlaceholdere("<p>Saken { saksnummer } er mottatt.</p>", verdier);
    expect(resultat).toContain('data-placeholder="saksnummer"');
    expect(resultat).toContain("2024/123456");
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

  it("lar valgtoken stå urørt – valget gjøres i editoren, ikke fra saksdata", () => {
    const html = "<p>{velg:A|B} og {saksnummer}</p>";
    const resultat = erstattPlaceholdere(html, [...verdier, { nokkel: "velg:A|B", verdi: "Skal ikke brukes" }]);
    expect(resultat).toContain("{velg:A|B}");
    expect(resultat).toContain("2024/123456");
  });

  it("HTML-escaper verdien før innsetting i markup", () => {
    const resultat = erstattPlaceholdere("<p>{navn}</p>", [{ nokkel: "navn", verdi: 'A <B> & "C"' }]);
    expect(resultat).toContain("A &lt;B&gt; &amp; &quot;C&quot;");
    expect(resultat).not.toContain("<B>");
  });
});

describe("parseValgToken", () => {
  it("leser alternativene ut av et valgtoken", () => {
    expect(parseValgToken("{velg:Bosnia-Hercegovina|Montenegro|Serbia}")).toEqual({
      alternativer: ["Bosnia-Hercegovina", "Montenegro", "Serbia"],
    });
  });

  it("trimmer luft rundt alternativene", () => {
    expect(parseValgToken("{velg: A | B }")).toEqual({ alternativer: ["A", "B"] });
  });

  it("avviser ett alternativ – det er ikke noe å velge mellom", () => {
    expect(parseValgToken("{velg:Bare denne}")).toBeNull();
  });

  it("avviser tomt alternativ som ville gitt et blankt valg", () => {
    expect(parseValgToken("{velg:A|}")).toBeNull();
  });

  it("avviser token uten alternativer i det hele tatt", () => {
    expect(parseValgToken("{velg:}")).toBeNull();
  });

  it("avviser vanlige nøkler", () => {
    expect(parseValgToken("{saksnummer}")).toBeNull();
  });

  it("avviser token med tagg-tegn, som aldri kan stamme fra ett tekstelement", () => {
    expect(parseValgToken("{velg:A|<b>B</b>}")).toBeNull();
  });
});

describe("erValgToken", () => {
  it("kjenner igjen et gyldig valgtoken", () => {
    expect(erValgToken("{velg:A|B}")).toBe(true);
  });

  it("regner ugyldig valgtoken som vanlig nøkkel", () => {
    expect(erValgToken("{velg:A}")).toBe(false);
  });
});

describe("parseValgAlternativer", () => {
  it("leser alternativene fra en data-valg-streng", () => {
    expect(parseValgAlternativer("A|B|C")).toEqual(["A", "B", "C"]);
  });

  it("gir tom liste for ett alternativ", () => {
    expect(parseValgAlternativer("A")).toEqual([]);
  });

  it("gir tom liste for tom streng (attributtet mangler eller er tomt)", () => {
    expect(parseValgAlternativer("")).toEqual([]);
  });

  it("slår sammen like alternativer – to like knapper er ikke noe valg", () => {
    expect(parseValgAlternativer("A|A|B")).toEqual(["A", "B"]);
  });

  it("avviser et token der alle alternativene er like", () => {
    expect(parseValgToken("{velg:A|A}")).toBeNull();
  });
});

describe("erUkjentPlaceholder", () => {
  const gyldige = ["saksnummer", "dagens-dato"];

  it("regner nøkkel som finnes i katalogen som gyldig", () => {
    expect(erUkjentPlaceholder("{saksnummer}", gyldige)).toBe(false);
  });

  it("regner nøkkel som ikke finnes i katalogen som ukjent", () => {
    expect(erUkjentPlaceholder("{sksnummer}", gyldige)).toBe(true);
  });

  it("ser bort fra luft rundt nøkkelen", () => {
    expect(erUkjentPlaceholder("{ saksnummer }", gyldige)).toBe(false);
  });

  it("skiller på store og små bokstaver", () => {
    expect(erUkjentPlaceholder("{Saksnummer}", gyldige)).toBe(true);
  });

  it("regner ingenting som ukjent uten liste (katalogen ikke lastet)", () => {
    expect(erUkjentPlaceholder("{tullenokkel}", undefined)).toBe(false);
  });

  it("regner ingenting som ukjent med tom liste (henting feilet)", () => {
    expect(erUkjentPlaceholder("{tullenokkel}", [])).toBe(false);
  });

  it("regner aldri et valgtoken som ukjent, selv om det ikke står i katalogen", () => {
    expect(erUkjentPlaceholder("{velg:A|B}", gyldige)).toBe(false);
  });

  it("regner ugyldig valgtoken som ukjent nøkkel", () => {
    expect(erUkjentPlaceholder("{velg:A}", gyldige)).toBe(true);
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

  it("pakker ut ukjent-markering som ligger lagret i innholdet", () => {
    const html = '<p><span class="placeholder-ukjent">{sksnummer}</span></p>';
    expect(fjernMarkeringsSpans(html)).toBe("<p>{sksnummer}</p>");
  });

  it("beholder klammemarkeringen når kun placeholder-klassene skal strippes", () => {
    const html =
      '<p><span class="bracketed-text">[navn <strong>x</strong>]</span> ' +
      '<span class="placeholder-uerstattet">{saksnummer}</span></p>';
    expect(fjernMarkeringsSpans(html, PLACEHOLDER_MARKERINGSKLASSER)).toBe(
      '<p><span class="bracketed-text">[navn <strong>x</strong>]</span> {saksnummer}</p>',
    );
  });

  it("pakker ut et innsatt valg, så innsettingen starter fra rått token igjen", () => {
    const html = '<p><span class="placeholder-valgt" data-valg="A|B">B</span></p>';
    expect(fjernMarkeringsSpans(html)).toBe("<p>B</p>");
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

  it("rapporterer ikke en verdi saksbehandler har valgt blant kandidatene", () => {
    const html = `<p>${utfylt("saksnummer", "MEL-21")}</p>`;
    const ferske: PlaceholderVerdi[] = [{ nokkel: "saksnummer", verdi: "MEL-22", kandidater: ["MEL-22", "MEL-21"] }];

    expect(finnUtdaterteVerdier(html, ferske)).toEqual([]);
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
