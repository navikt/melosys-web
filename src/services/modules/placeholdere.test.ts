import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  Betingelse,
  BetingelseBeskrivelse,
  erBetingelsesToken,
  erstattPlaceholdere,
  erUkjentPlaceholder,
  erValgToken,
  finnSakstypeKonflikter,
  finnUopplosteBetingelser,
  finnUtdaterteVerdier,
  finnUutfylteKlammer,
  finnUutfylteTokener,
  hentKatalog,
  PlaceholderBeskrivelse,
  fjernMarkeringsSpans,
  losOppBetingelser,
  parseHvisStartToken,
  parseValgAlternativer,
  parseValgToken,
  PLACEHOLDER_MARKERINGSKLASSER,
  PlaceholderVerdi,
} from "./placeholdere";
import { getAsJson } from "../utils";

vi.mock("../utils", () => ({ getAsJson: vi.fn() }));

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
      { nokkel: "saksnummer", innsattVerdi: "MEL-21", ferskVerdi: "MEL-22", fortsattKandidat: false },
    ]);
  });

  it("rapporterer ikke identiske verdier", () => {
    const html = `<p>${utfylt("saksnummer", "2024/123456")}</p>`;
    expect(finnUtdaterteVerdier(html, verdier)).toEqual([]);
  });

  it("rapporterer avvik som fortsatt står i kandidatlisten, flagget som mulig bevisst valg", () => {
    // Et forhåndsvalg som senere endret seg kan bli stående i kandidatlisten – da må
    // avviket varsles likevel, ellers går utdaterte verdier ut i brevet uten varsel.
    const html = `<p>${utfylt("saksnummer", "MEL-21")}</p>`;
    const ferske: PlaceholderVerdi[] = [{ nokkel: "saksnummer", verdi: "MEL-22", kandidater: ["MEL-22", "MEL-21"] }];

    expect(finnUtdaterteVerdier(html, ferske)).toEqual([
      { nokkel: "saksnummer", innsattVerdi: "MEL-21", ferskVerdi: "MEL-22", fortsattKandidat: true },
    ]);
  });

  it("rapporterer nøkkel uten fersk verdi med tom ferskVerdi", () => {
    const html = `<p>${utfylt("utgaatt-nokkel", "Gammel verdi")}</p>`;
    expect(finnUtdaterteVerdier(html, verdier)).toEqual([
      { nokkel: "utgaatt-nokkel", innsattVerdi: "Gammel verdi", ferskVerdi: "", fortsattKandidat: false },
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

describe("parseHvisStartToken", () => {
  it("leser nøkkelen ut av starttokenet", () => {
    expect(parseHvisStartToken("{#hvis delvis-innvilgelse}")).toEqual({ nokkel: "delvis-innvilgelse" });
  });

  it("godtar flere mellomrom etter #hvis", () => {
    expect(parseHvisStartToken("{#hvis  avslag}")).toEqual({ nokkel: "avslag" });
  });

  it("avviser tom nøkkel og nøkkel med mellomrom", () => {
    expect(parseHvisStartToken("{#hvis }")).toBeNull();
    expect(parseHvisStartToken("{#hvis to ord}")).toBeNull();
  });
});

describe("erBetingelsesToken", () => {
  it("kjenner igjen begge tokenformene", () => {
    expect(erBetingelsesToken("{#hvis avslag}")).toBe(true);
    expect(erBetingelsesToken("{/hvis}")).toBe(true);
  });

  it("er ikke et betingelsestoken for vanlige nøkler eller valg", () => {
    expect(erBetingelsesToken("{saksnummer}")).toBe(false);
    expect(erBetingelsesToken("{velg:A|B}")).toBe(false);
  });
});

describe("erUkjentPlaceholder for betingelsestokener", () => {
  it("markerer aldri reserverte betingelsestokener som ukjente", () => {
    expect(erUkjentPlaceholder("{#hvis avslag}", ["saksnummer"])).toBe(false);
    expect(erUkjentPlaceholder("{/hvis}", ["saksnummer"])).toBe(false);
  });
});

describe("losOppBetingelser", () => {
  const oppfylt: Betingelse[] = [{ nokkel: "avslag", oppfylt: true }];
  const ikkeOppfylt: Betingelse[] = [{ nokkel: "avslag", oppfylt: false }];

  const blokkHtml = "<p>Før</p><p>{#hvis avslag}</p><p>Betinget</p><p>{/hvis}</p><p>Etter</p>";

  it("beholder blokkinnholdet og fjerner tokenavsnittene når betingelsen er oppfylt", () => {
    expect(losOppBetingelser(blokkHtml, oppfylt)).toBe("<p>Før</p><p>Betinget</p><p>Etter</p>");
  });

  it("fjerner blokkinnholdet og tokenavsnittene når betingelsen ikke er oppfylt", () => {
    expect(losOppBetingelser(blokkHtml, ikkeOppfylt)).toBe("<p>Før</p><p>Etter</p>");
  });

  it("beholder tekstspennet inline og fjerner bare tokenene når betingelsen er oppfylt", () => {
    const html = "<p>Vedtaket er {#hvis avslag}avslått{/hvis} i saken.</p>";
    expect(losOppBetingelser(html, oppfylt)).toBe("<p>Vedtaket er avslått i saken.</p>");
  });

  // Tokenene står med mellomrom på hver side; uten normalisering ble det dobbelt igjen.
  it("fjerner tekstspennet inline og etterlater ett mellomrom når betingelsen ikke er oppfylt", () => {
    const html = "<p>Vedtaket er {#hvis avslag}avslått{/hvis} i saken.</p>";
    expect(losOppBetingelser(html, ikkeOppfylt)).toBe("<p>Vedtaket er i saken.</p>");
  });

  // Quill skriver nbsp der et vanlig mellomrom ville kollapset.
  it("regner nbsp foran starttokenet som mellomrom", () => {
    const html = "<p>Vedtaket er\u00a0{#hvis avslag}avslått{/hvis} i saken.</p>";
    expect(losOppBetingelser(html, ikkeOppfylt)).toBe("<p>Vedtaket er&nbsp;i saken.</p>");
  });

  it("beholder formatert innhold mellom tokenene i samme blokk når betingelsen er oppfylt", () => {
    const html = "<p>Vedtaket er {#hvis avslag}<strong>avslått</strong>{/hvis} i saken.</p>";
    expect(losOppBetingelser(html, oppfylt)).toBe("<p>Vedtaket er <strong>avslått</strong> i saken.</p>");
  });

  it("fjerner både tokenene og elementene mellom dem i samme blokk når betingelsen ikke er oppfylt", () => {
    const html = "<p>Vedtaket er {#hvis avslag}<strong>avslått</strong> med <em>frist</em>{/hvis} i saken.</p>";
    expect(losOppBetingelser(html, ikkeOppfylt)).toBe("<p>Vedtaket er i saken.</p>");
  });

  it("løser paret når tokenene deler blokk, men står i hver sin celle-frie tekstnode", () => {
    const html = "<li>{#hvis avslag}Avslag <strong>gjelder</strong>{/hvis}</li>";
    expect(losOppBetingelser(html, oppfylt)).toBe("<li>Avslag <strong>gjelder</strong></li>");
    expect(losOppBetingelser(html, ikkeOppfylt)).toBe("<li></li>");
  });

  it("løser de gyldige parene og hopper bare over paret uten entydig omfang", () => {
    const html =
      "<p>{#hvis avslag}</p><p>Betinget</p><p>{/hvis}</p>" +
      "<p>Tekst {#hvis annen} mer</p><p>Uavklart</p><p>{/hvis}</p>";
    const betingelser: Betingelse[] = [
      { nokkel: "avslag", oppfylt: true },
      { nokkel: "annen", oppfylt: false },
    ];

    expect(losOppBetingelser(html, betingelser)).toBe(
      "<p>Betinget</p><p>Tekst {#hvis annen} mer</p><p>Uavklart</p><p>{/hvis}</p>",
    );
  });

  // Å fjerne cellene ville revet raden i stykker; tokenene blir heller stående markert.
  it("rører ikke en tabellrad der tokenene står i hver sin celle", () => {
    const html = "<table><tbody><tr><td>{#hvis avslag}</td><td>X</td><td>{/hvis}</td></tr></tbody></table>";
    expect(losOppBetingelser(html, ikkeOppfylt)).toBe(html);
    expect(losOppBetingelser(html, oppfylt)).toBe(html);
  });

  it("rører ikke listepunkter der tokenene står i hvert sitt punkt", () => {
    const html = "<ul><li>{#hvis avslag}</li><li>Betinget</li><li>{/hvis}</li></ul>";
    expect(losOppBetingelser(html, ikkeOppfylt)).toBe(html);
  });

  it("fjerner løse tekstnoder mellom blokkene når betingelsen ikke er oppfylt", () => {
    const html = "<p>{#hvis avslag}</p>Løs tekst<p>Betinget</p><p>{/hvis}</p><p>Etter</p>";
    expect(losOppBetingelser(html, ikkeOppfylt)).toBe("<p>Etter</p>");
  });

  it("løser flere inline-par i samme tekstnode uten å forskyve indeksene", () => {
    const html = "<p>{#hvis a}A{/hvis} og {#hvis b}B{/hvis}.</p>";
    const betingelser: Betingelse[] = [
      { nokkel: "a", oppfylt: true },
      { nokkel: "b", oppfylt: false },
    ];
    expect(losOppBetingelser(html, betingelser)).toBe("<p>A og .</p>");
  });

  it("lar alt stå urørt når nøkkelen er ukjent", () => {
    expect(losOppBetingelser(blokkHtml, [{ nokkel: "annen", oppfylt: true }])).toBe(blokkHtml);
  });

  it("lar alt stå urørt uten betingelser (toggle av / eldre api)", () => {
    expect(losOppBetingelser(blokkHtml, undefined)).toBe(blokkHtml);
    expect(losOppBetingelser(blokkHtml, [])).toBe(blokkHtml);
  });

  it("rører ingenting når tokenene er ubalanserte", () => {
    const utenSlutt = "<p>{#hvis avslag}</p><p>Betinget</p>";
    const utenStart = "<p>Betinget</p><p>{/hvis}</p>";
    expect(losOppBetingelser(utenSlutt, oppfylt)).toBe(utenSlutt);
    expect(losOppBetingelser(utenStart, oppfylt)).toBe(utenStart);
  });

  // Valgt feilmodus: nesting støttes ikke, og hele dokumentet står urørt så forfatteren ser
  // tokenene og kan rette dem – heller enn at et ytre par sletter et indre.
  it("rører ingenting ved nestede par", () => {
    const html = "<p>{#hvis avslag}</p><p>{#hvis annen}</p><p>X</p><p>{/hvis}</p><p>{/hvis}</p>";
    expect(losOppBetingelser(html, [{ nokkel: "avslag", oppfylt: false }])).toBe(html);
  });

  it("rører ingenting når tokenene verken deler tekstnode eller står alene i hver sin blokk", () => {
    const html = "<p>Tekst {#hvis avslag} mer</p><p>Betinget</p><p>{/hvis}</p>";
    expect(losOppBetingelser(html, oppfylt)).toBe(html);
  });

  it("rører ingenting når tokenblokkene har ulik forelder", () => {
    const html = "<div><p>{#hvis avslag}</p></div><div><p>{/hvis}</p></div>";
    expect(losOppBetingelser(html, ikkeOppfylt)).toBe(html);
  });

  it("returnerer HTML-en uendret når den ikke har betingelsestokener", () => {
    const html = "<p>Saken {saksnummer} er mottatt.</p>";
    expect(losOppBetingelser(html, oppfylt)).toBe(html);
  });

  it("styrer overskrifter og lister på blokknivå", () => {
    const html = "<p>{#hvis avslag}</p><h2>Tittel</h2><ol><li>Ett</li></ol><p>{/hvis}</p>";
    expect(losOppBetingelser(html, ikkeOppfylt)).toBe("");
    expect(losOppBetingelser(html, oppfylt)).toBe("<h2>Tittel</h2><ol><li>Ett</li></ol>");
  });
});

describe("finnUopplosteBetingelser", () => {
  it("lister nøkkelen til et par som fortsatt står i teksten", () => {
    const html = "<p>{#hvis avslag}</p><p>Betinget</p><p>{/hvis}</p>";
    expect(finnUopplosteBetingelser(html)).toEqual(["avslag"]);
  });

  it("lister hver nøkkel én gang, i rekkefølgen de står i brevet", () => {
    const html = "<p>{#hvis avslag}A{/hvis} {#hvis frist}B{/hvis} {#hvis avslag}C{/hvis}</p>";
    expect(finnUopplosteBetingelser(html)).toEqual(["avslag", "frist"]);
  });

  it("finner tokener som ligger inni markerings-spans fra editoren", () => {
    const html = '<p><span class="placeholder-betingelse">{#hvis avslag}</span></p>';
    expect(finnUopplosteBetingelser(html)).toEqual(["avslag"]);
  });

  it("varsler om et slutt-token uten lesbart starttoken", () => {
    expect(finnUopplosteBetingelser("<p>Tekst{/hvis}</p>")).toEqual(["{/hvis}"]);
  });

  it("tar med et foreldreløst slutt-token også når gyldige nøkler finnes", () => {
    const html = "<p>{#hvis avslag}Avslag{/hvis} og {/hvis}</p>";
    expect(finnUopplosteBetingelser(html)).toEqual(["avslag", "{/hvis}"]);
  });

  it("lister et misformet starttoken ordrett, uten å påstå at det står et {/hvis} i brevet", () => {
    expect(finnUopplosteBetingelser("<p>{#hvis to ord}</p>")).toEqual(["{#hvis to ord}"]);
  });

  it("varsler om et uavsluttet {#hvis-fragment", () => {
    expect(finnUopplosteBetingelser("<p>{#hvis avslag</p>")).toEqual(["{#hvis"]);
  });

  // Uten <>\n-ekskludering ville mønsteret spent fra fragmentet til klammen i neste avsnitt
  // og listet hele HTML-en imellom som «nøkkel».
  it("lister en kort markør, ikke en HTML-blob, når en løs } står i et annet avsnitt", () => {
    const uopploste = finnUopplosteBetingelser("<p>{#hvis avslag</p><p>et helt avsnitt til}</p>");

    expect(uopploste).toEqual(["{#hvis"]);
  });

  it("varsler om {/hvis} som står før sin egen start", () => {
    expect(finnUopplosteBetingelser("<p>{/hvis} tekst {#hvis avslag}</p>")).toEqual(["avslag", "{/hvis}"]);
  });

  it("gir tom liste for tekst uten betingelsestokener", () => {
    expect(finnUopplosteBetingelser("<p>Saken {saksnummer} er mottatt.</p>")).toEqual([]);
    expect(finnUopplosteBetingelser("")).toEqual([]);
  });
});

describe("hentKatalog – normalisering på api-grensen", () => {
  beforeEach(() => vi.mocked(getAsJson).mockReset());

  const placeholder = (nokkel: string, sakstyper: unknown[]) => ({
    nokkel,
    visningsnavn: nokkel,
    beskrivelse: "",
    eksempel: "",
    sakstyper,
  });

  // Api-et har levert begge former; web skal tåle en revert uten å miste sakstypene.
  it("leser sakstyper både som {kode}-objekter og som rene koder", async () => {
    vi.mocked(getAsJson).mockResolvedValue({
      placeholdere: [placeholder("a", [{ kode: "EU_EOS", term: "EU/EØS-land" }]), placeholder("b", ["FTRL"])],
      betingelser: [{ nokkel: "c", visningsnavn: "C", beskrivelse: "", sakstyper: [{ kode: "TRYGDEAVTALE" }] }],
    });

    const katalog = await hentKatalog();

    expect(katalog.placeholdere.map(({ sakstyper }) => sakstyper)).toEqual([["EU_EOS"], ["FTRL"]]);
    expect(katalog.betingelser?.[0].sakstyper).toEqual(["TRYGDEAVTALE"]);
  });

  it("gir tom sakstypeliste når feltet mangler, og lar betingelsene være uleverte", async () => {
    vi.mocked(getAsJson).mockResolvedValue({ placeholdere: [{ nokkel: "a", visningsnavn: "A" }] });

    const katalog = await hentKatalog();

    expect(katalog.placeholdere[0].sakstyper).toEqual([]);
    expect(katalog.betingelser).toBeUndefined();
  });
});

describe("finnSakstypeKonflikter", () => {
  const katalog: PlaceholderBeskrivelse[] = [
    {
      nokkel: "soker-navn",
      visningsnavn: "Søkers navn",
      beskrivelse: "Fullt navn",
      eksempel: "Ola Nordmann",
      sakstyper: ["EU_EOS"],
    },
    {
      nokkel: "saksnummer",
      visningsnavn: "Saksnummer",
      beskrivelse: "Saksnummer",
      eksempel: "MEL-21",
      sakstyper: [],
    },
  ];

  const betingelseKatalog: BetingelseBeskrivelse[] = [
    { nokkel: "avslag", visningsnavn: "Avslag", beskrivelse: "Saken er avslått", sakstyper: ["EU_EOS"] },
  ];

  it("rapporterer sakstypene placeholderen ikke dekker", () => {
    const konflikter = finnSakstypeKonflikter("<p>{soker-navn}</p>", ["EU_EOS", "FTRL"], katalog, betingelseKatalog);

    expect(konflikter).toEqual([
      { nokkel: "soker-navn", visningsnavn: "Søkers navn", sakstyper: ["FTRL"], stottedeSakstyper: ["EU_EOS"] },
    ]);
  });

  it("rapporterer betingelser fra hvis-tokener på samme måte", () => {
    const konflikter = finnSakstypeKonflikter(
      "<p>{#hvis avslag}Avslått{/hvis}</p>",
      ["TRYGDEAVTALE"],
      katalog,
      betingelseKatalog,
    );

    expect(konflikter).toEqual([
      { nokkel: "avslag", visningsnavn: "Avslag", sakstyper: ["TRYGDEAVTALE"], stottedeSakstyper: ["EU_EOS"] },
    ]);
  });

  it("rapporterer ingenting når alle valgte sakstyper er dekket", () => {
    expect(finnSakstypeKonflikter("<p>{soker-navn}</p>", ["EU_EOS"], katalog, betingelseKatalog)).toEqual([]);
  });

  it("rapporterer de støttede sakstypene når blokken gjelder alle", () => {
    const konflikter = finnSakstypeKonflikter("<p>{soker-navn}</p>", [], katalog, betingelseKatalog);

    expect(konflikter).toEqual([
      { nokkel: "soker-navn", visningsnavn: "Søkers navn", sakstyper: [], stottedeSakstyper: ["EU_EOS"] },
    ]);
  });

  it("rapporterer ingenting for en placeholder uten avgrensning når blokken gjelder alle", () => {
    expect(finnSakstypeKonflikter("<p>{saksnummer}</p>", [], katalog, betingelseKatalog)).toEqual([]);
  });

  it("hopper over placeholdere som gjelder alle sakstyper, ukjente nøkler og valgtokener", () => {
    const html = "<p>{saksnummer} {finnes-ikke} {velg:Ja|Nei}</p>";

    expect(finnSakstypeKonflikter(html, ["FTRL"], katalog, betingelseKatalog)).toEqual([]);
  });

  it("rapporterer hver nøkkel én gang selv om den står flere steder", () => {
    const html = "<p>{soker-navn}</p><p>{soker-navn}</p>";

    expect(finnSakstypeKonflikter(html, ["FTRL"], katalog, betingelseKatalog)).toHaveLength(1);
  });
});

describe("finnUutfylteKlammer", () => {
  it("lister klammefelt i teksten", () => {
    expect(finnUutfylteKlammer("<p>Hei [navn], du får [beløp].</p>")).toEqual(["[navn]", "[beløp]"]);
  });

  it("lister klammefelt som editoren har markert, uten duplikat", () => {
    const html = '<p>Hei <span class="bracketed-text">[navn]</span> og [navn].</p>';
    expect(finnUutfylteKlammer(html)).toEqual(["[navn]"]);
  });

  it("lister ikke tokener – de hører til finnUutfylteTokener", () => {
    expect(finnUutfylteKlammer("<p>{saksnummer}</p>")).toEqual([]);
  });

  it("lister ingenting for et utfylt brev", () => {
    const html =
      '<p>Saken <span class="placeholder-utfylt" data-placeholder="saksnummer">MEL-21</span> er mottatt.</p>';
    expect(finnUutfylteKlammer(html)).toEqual([]);
    expect(finnUutfylteKlammer("")).toEqual([]);
  });
});

describe("finnUutfylteTokener", () => {
  it("lister uerstattede tokener og uvalgte valgtokener", () => {
    const html = "<p>{saksnummer} {velg:Ja|Nei}</p>";
    expect(finnUutfylteTokener(html)).toEqual(["{saksnummer}", "{velg:Ja|Nei}"]);
  });

  it("lister ikke betingelsestokener – de varsles for seg", () => {
    expect(finnUutfylteTokener("<p>{#hvis avslag}Avslag{/hvis}</p>")).toEqual([]);
  });

  // Partisjonen mot finnUopplosteBetingelser: et misformet betingelsestoken skal varsles
  // ett sted, ikke stå som «uutfylt felt» i tillegg.
  it("lister ikke et misformet betingelsestoken", () => {
    const html = "<p>{#hvis to ord}</p>";

    expect(finnUutfylteTokener(html)).toEqual([]);
    expect(finnUopplosteBetingelser(html)).toEqual(["{#hvis to ord}"]);
  });

  it("lister ikke klammefelt", () => {
    expect(finnUutfylteTokener("<p>Hei [navn].</p>")).toEqual([]);
  });
});
