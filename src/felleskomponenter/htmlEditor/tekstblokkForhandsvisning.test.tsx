import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import TekstblokkForhandsvisning from "./tekstblokkForhandsvisning";
import { PlaceholderVerdi } from "../../services/modules/placeholdere";
import useFeatureToggle from "../../featuretoggle/useFeatureToggle";

vi.mock("../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

const verdier: PlaceholderVerdi[] = [{ nokkel: "saksnummer", verdi: "2024/123456" }];

const renderHtml = (html: string, placeholderVerdier?: PlaceholderVerdi[]) =>
  render(<TekstblokkForhandsvisning html={html} placeholderVerdier={placeholderVerdier} />).container;

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

  it("rører ikke krøllparenteser med togglen av, men uthever fortsatt klammer", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);

    const container = renderHtml("<p>Se [KLAMME] og {saksnummer} her.</p>", verdier);

    expect(container.querySelector(".bracketed-text")?.textContent).toBe("[KLAMME]");
    expect(container.querySelector(".placeholder-uerstattet")).toBeNull();
    expect(container.querySelector(".placeholder-utfylt")).toBeNull();
    expect(container.textContent).toContain("{saksnummer}");
  });
});
