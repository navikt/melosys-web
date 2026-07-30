import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import TekstblokkForhandsvisning from "./tekstblokkForhandsvisning";

const renderHtml = (html: string) => render(<TekstblokkForhandsvisning html={html} />).container.innerHTML;

describe("TekstblokkForhandsvisning", () => {
  it("uthever både klammer og uerstattede placeholdere", () => {
    const markup = renderHtml("<p>Se [KLAMME] og {nokkel} her.</p>");
    expect(markup).toContain('<span class="bracketed-text">[KLAMME]</span>');
    expect(markup).toContain('<span class="placeholder-uerstattet">{nokkel}</span>');
  });

  it("uthever ikke krøllparenteser som løper over tag- eller avsnittsgrenser", () => {
    expect(renderHtml("<p>Et { her</p><p>og et } der</p>")).not.toContain("placeholder-uerstattet");
  });
});
