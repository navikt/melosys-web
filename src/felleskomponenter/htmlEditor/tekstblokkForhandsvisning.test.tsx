import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import TekstblokkForhandsvisning from "./tekstblokkForhandsvisning";
import { PlaceholderVerdi } from "../../services/modules/placeholdere";
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

  it("gir uerstattet markering en forklarende tooltip", () => {
    const markering = renderHtml("<p>{nokkel}</p>").querySelector(".placeholder-uerstattet");
    expect(markering?.getAttribute("title")).toContain("Ingen verdi tilgjengelig");
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

  it("beholder lagret klammemarkering rundt innhold med inline-tagger", () => {
    const container = renderHtml('<p><span class="bracketed-text">[navn <strong>x</strong>]</span></p>');

    expect(container.querySelectorAll(".bracketed-text")).toHaveLength(1);
    expect(container.querySelector(".bracketed-text")?.textContent).toBe("[navn x]");
  });

  it("markerer ukjent nøkkel rødt og gyldig nøkkel uten verdi gult", () => {
    const container = renderHtml("<p>{fornavn} og {frnavn}</p>", undefined, ["fornavn"]);

    expect(container.querySelector(".placeholder-uerstattet")?.textContent).toBe("{fornavn}");
    expect(container.querySelector(".placeholder-ukjent")?.textContent).toBe("{frnavn}");
    expect(container.querySelector(".placeholder-ukjent")?.getAttribute("title")).toContain(
      "Ikke en gyldig placeholder",
    );
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

  it("rører ikke krøllparenteser med togglen av, men uthever fortsatt klammer", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);

    const container = renderHtml("<p>Se [KLAMME] og {saksnummer} her.</p>", verdier);

    expect(container.querySelector(".bracketed-text")?.textContent).toBe("[KLAMME]");
    expect(container.querySelector(".placeholder-uerstattet")).toBeNull();
    expect(container.querySelector(".placeholder-utfylt")).toBeNull();
    expect(container.textContent).toContain("{saksnummer}");
  });
});
