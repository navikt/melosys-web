import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import TekstblokkForhandsvisning from "./tekstblokkForhandsvisning";
import { Betingelse, PlaceholderVerdi } from "../../services/modules/placeholdere";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";

vi.mock("../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

const verdier: PlaceholderVerdi[] = [{ nokkel: "saksnummer", verdi: "2024/123456" }];

const renderHtml = (html: string, placeholderVerdier?: PlaceholderVerdi[], gyldigeNokler?: string[]) =>
  render(
    <TekstblokkForhandsvisning html={html} placeholderVerdier={placeholderVerdier} gyldigeNokler={gyldigeNokler} />,
  ).container;

const markupFor = (html: string, placeholderVerdier?: PlaceholderVerdi[]) =>
  renderHtml(html, placeholderVerdier).innerHTML;

describe("TekstblokkForhandsvisning", () => {
  beforeEach(() => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
  });

  it("uthever både klammer og uerstattede placeholdere", () => {
    const container = renderHtml("<p>Se [KLAMME] og {nokkel} her.</p>");
    expect(container.querySelector(".bracketed-text")?.textContent).toBe("[KLAMME]");
    expect(container.querySelector(".placeholder-uerstattet")?.textContent).toBe("{nokkel}");
  });

  it("uthever ikke krøllparenteser som løper over tag- eller avsnittsgrenser", () => {
    expect(markupFor("<p>Et { her</p><p>og et } der</p>")).not.toContain("placeholder-uerstattet");
  });

  it("sier at nøkkelen mangler verdi når forhåndsvisningen har sakens verdier", () => {
    const markering = renderHtml("<p>{nokkel}</p>", verdier).querySelector(".placeholder-uerstattet");
    expect(markering?.getAttribute("title")).toContain("Ingen verdi tilgjengelig");
  });

  it("lover erstatning ved innsetting når forhåndsvisningen er uten verdier (admin)", () => {
    const markering = renderHtml("<p>{nokkel}</p>").querySelector(".placeholder-uerstattet");
    expect(markering?.getAttribute("title")).toBe(
      "Erstattes automatisk ved innsetting fra Send brev dersom saken har en verdi – ellers fylles den ut manuelt",
    );
    expect(markering?.getAttribute("title")).not.toContain("Ingen verdi tilgjengelig");
  });

  it("viser verdien med utfylt-markering når editoren har placeholderverdier", () => {
    const container = renderHtml("<p>Saken {saksnummer} er mottatt.</p>", verdier);
    const markering = container.querySelector(".placeholder-utfylt");
    expect(markering?.textContent).toBe("2024/123456");
    expect(markering?.getAttribute("title")).toBe("Fylt inn automatisk fra saken (saksnummer)");
    expect(container.innerHTML).not.toContain("{saksnummer}");
  });

  it("uthever fortsatt nøkler uten verdi gult når verdier finnes", () => {
    const container = renderHtml("<p>Hei {fornavn}, saken {saksnummer}.</p>", verdier);
    expect(container.querySelector(".placeholder-uerstattet")?.textContent).toBe("{fornavn}");
    expect(container.querySelector(".placeholder-utfylt")?.textContent).toBe("2024/123456");
  });

  it("viser rå nøkkel uten verdier (saksflyt, admin)", () => {
    const container = renderHtml("<p>Saken {saksnummer} er mottatt.</p>");
    expect(container.querySelector(".placeholder-utfylt")).toBeNull();
    expect(container.querySelector(".placeholder-uerstattet")?.textContent).toBe("{saksnummer}");
  });

  it("erstatter nøkkelen selv om markeringen ligger lagret i innholdet", () => {
    const container = renderHtml('<p><span class="placeholder-uerstattet">{saksnummer}</span></p>', verdier);

    expect(container.querySelector(".placeholder-utfylt")?.textContent).toBe("2024/123456");
    expect(container.querySelector(".placeholder-uerstattet")).toBeNull();
  });

  it("uthever dobbeltnøstet lagret klammemarkering som én markering", () => {
    const container = renderHtml(
      '<p><span class="bracketed-text"><span class="bracketed-text">[dato]</span></span></p>',
    );

    expect(container.querySelectorAll(".bracketed-text")).toHaveLength(1);
    expect(container.querySelector(".bracketed-text")?.textContent).toBe("[dato]");
  });

  // Regexen kan ikke gjenskape markering rundt inline-tagger, så spanet må stå igjen.
  it("beholder lagret klammemarkering rundt innhold med inline-tagger", () => {
    const container = renderHtml('<p><span class="bracketed-text">[navn <strong>x</strong>]</span></p>');

    const markering = container.querySelector(".bracketed-text");
    expect(markering?.textContent).toBe("[navn x]");
    expect(markering?.querySelector("strong")?.textContent).toBe("x");
  });

  it("markerer ukjent nøkkel rødt og gyldig nøkkel uten verdi gult", () => {
    const container = renderHtml("<p>{fornavn} og {frnavn}</p>", undefined, ["fornavn"]);

    expect(container.querySelector(".placeholder-uerstattet")?.textContent).toBe("{fornavn}");
    expect(container.querySelector(".placeholder-ukjent")?.textContent).toBe("{frnavn}");
    expect(container.querySelector(".placeholder-ukjent")?.getAttribute("title")).toContain(
      "Ikke en gyldig placeholder",
    );
  });

  // Editoren ser U+00A0 (som trim() tar), mens forhåndsvisningen leser HTML-strengen der
  // Quill kan ha lagret mellomrommet som &nbsp;-entitet. Begge skal gi samme nøkkel.
  it("behandler et token med &nbsp;-entitet som samme nøkkel som med vanlig mellomrom", () => {
    const container = renderHtml("<p>Saken {&nbsp;saksnummer&nbsp;} er mottatt.</p>", verdier, ["saksnummer"]);

    expect(container.querySelector(".placeholder-utfylt")?.textContent).toBe("2024/123456");
    expect(container.querySelector(".placeholder-ukjent")).toBeNull();
  });

  it("markerer alt gult uten kjente nøkler (katalogen ikke lastet)", () => {
    const container = renderHtml("<p>{frnavn}</p>");

    expect(container.querySelector(".placeholder-ukjent")).toBeNull();
    expect(container.querySelector(".placeholder-uerstattet")?.textContent).toBe("{frnavn}");
  });

  it("markerer ikke nøkkel som er fylt inn med verdi som ukjent", () => {
    const container = renderHtml("<p>Saken {saksnummer}.</p>", verdier, ["saksnummer"]);

    expect(container.querySelector(".placeholder-utfylt")?.textContent).toBe("2024/123456");
    expect(container.querySelector(".placeholder-ukjent")).toBeNull();
  });

  it("markerer valgtoken som valg, ikke som ukjent nøkkel", () => {
    const container = renderHtml("<p>Land: {velg:Serbia|Montenegro}</p>", undefined, ["saksnummer"]);

    const markering = container.querySelector(".placeholder-valg");
    expect(markering?.textContent).toBe("{velg:Serbia|Montenegro}");
    // Forhåndsvisningen er ikke klikkbar, så tittelen kan ikke love et klikk.
    expect(markering?.getAttribute("title")).toBe("Alternativet velges når teksten settes inn i brevet");
    expect(markering?.getAttribute("title")).not.toContain("Klikk");
    expect(container.querySelector(".placeholder-ukjent")).toBeNull();
  });

  it("markerer valgtoken med for få alternativer som ukjent nøkkel", () => {
    const container = renderHtml("<p>{velg:Bare denne}</p>", undefined, ["saksnummer"]);

    expect(container.querySelector(".placeholder-valg")).toBeNull();
    expect(container.querySelector(".placeholder-ukjent")?.textContent).toBe("{velg:Bare denne}");
  });

  it("viser et lagret valg som ren tekst uten markering", () => {
    const container = renderHtml('<p><span class="placeholder-valgt" data-valg="A|B">B</span></p>');

    expect(container.querySelector(".placeholder-valgt")).toBeNull();
    expect(container.textContent).toBe("B");
  });

  it("markerer betingelsestokener nøytralt uten betingelser (admin/saksflyt)", () => {
    const container = renderHtml("<p>{#hvis avslag}</p><p>Betinget</p><p>{/hvis}</p>", undefined, ["saksnummer"]);

    const markeringer = container.querySelectorAll(".placeholder-betingelse");
    expect(Array.from(markeringer).map((node) => node.textContent)).toEqual(["{#hvis avslag}", "{/hvis}"]);
    expect(container.querySelector(".placeholder-ukjent")).toBeNull();
    expect(container.textContent).toContain("Betinget");
  });

  it("gir betingelsesmarkeringen en tooltip om at den løses ved innsetting", () => {
    const container = renderHtml("<p>{/hvis}</p>");
    expect(container.querySelector(".placeholder-betingelse")?.getAttribute("title")).toContain("Send brev");
  });

  it("løser opp betingelsen når betingelsene er tilgjengelige", () => {
    const betingelser: Betingelse[] = [{ nokkel: "avslag", oppfylt: true }];
    const container = render(
      <TekstblokkForhandsvisning
        html="<p>{#hvis avslag}</p><p>Betinget</p><p>{/hvis}</p><p>Etter</p>"
        betingelser={betingelser}
      />,
    ).container;

    expect(container.querySelector(".placeholder-betingelse")).toBeNull();
    expect(container.textContent).toBe("BetingetEtter");
  });

  it("fjerner innholdet i forhåndsvisningen når betingelsen ikke er oppfylt", () => {
    const betingelser: Betingelse[] = [{ nokkel: "avslag", oppfylt: false }];
    const container = render(
      <TekstblokkForhandsvisning
        html="<p>{#hvis avslag}</p><p>Betinget</p><p>{/hvis}</p><p>Etter</p>"
        betingelser={betingelser}
      />,
    ).container;

    expect(container.textContent).toBe("Etter");
  });

  it("rører ikke krøllparenteser med togglen av, men uthever fortsatt klammer", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);

    const container = renderHtml("<p>Se [KLAMME] og {saksnummer} her.</p>", verdier);

    expect(container.querySelector(".bracketed-text")?.textContent).toBe("[KLAMME]");
    expect(container.querySelector(".placeholder-uerstattet")).toBeNull();
    expect(container.querySelector(".placeholder-utfylt")).toBeNull();
    expect(container.textContent).toContain("{saksnummer}");
  });

  it("beholder lagret klammemarkering rundt inline-tagger med togglen av (master-oppførsel)", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);

    const container = renderHtml('<p><span class="bracketed-text">[navn <strong>x</strong>]</span></p>');

    const markering = container.querySelector(".bracketed-text");
    expect(markering?.textContent).toBe("[navn x]");
    expect(markering?.querySelector("strong")?.textContent).toBe("x");
  });

  it("pakker ikke lagret klammemarkering dobbelt med togglen av", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);

    const container = renderHtml('<p><span class="bracketed-text">[dato]</span> og [sted]</p>');

    expect(container.querySelectorAll(".bracketed-text")).toHaveLength(2);
    expect(container.querySelector(".bracketed-text .bracketed-text")).toBeNull();
  });

  it("stripper lagrede placeholder-markeringer med togglen av, men beholder klamme-spans", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);

    const container = renderHtml(
      '<p><span class="placeholder-uerstattet">{saksnummer}</span> i <span class="bracketed-text">[navn <em>y</em>]</span></p>',
    );

    expect(container.querySelector(".placeholder-uerstattet")).toBeNull();
    expect(container.querySelector(".bracketed-text")?.textContent).toBe("[navn y]");
    expect(container.textContent).toContain("{saksnummer}");
  });
});
