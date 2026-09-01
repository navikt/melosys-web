import { describe, expect, it } from "vitest";

import { htmlTilRenTekst } from "./htmlTilRenTekst";

describe("htmlTilRenTekst", () => {
  it("skiller avsnitt med en tom linje", () => {
    expect(htmlTilRenTekst("<p>Første</p><p>Andre</p>")).toBe("Første\n\nAndre");
  });

  it("gjør <br> til et enkelt linjeskift", () => {
    expect(htmlTilRenTekst("<p>Linje en<br>Linje to</p>")).toBe("Linje en\nLinje to");
  });

  it("markerer punkter, som ellers ville smeltet sammen uten listestruktur", () => {
    expect(htmlTilRenTekst("<ul><li>Ett</li><li>To</li></ul>")).toBe("- Ett\n- To");
  });

  it("holder punktene tett, men skiller lista fra avsnittene rundt", () => {
    expect(htmlTilRenTekst("<p>Før</p><ul><li>Ett</li><li>To</li></ul><p>Etter</p>")).toBe(
      "Før\n\n- Ett\n- To\n\nEtter",
    );
  });

  it("beholder teksten i inline-markup uten å ta med taggene", () => {
    expect(htmlTilRenTekst("<p>Du er <strong>utsendt</strong> til <em>USA</em></p>")).toBe("Du er utsendt til USA");
  });

  it("lar placeholdere og betingelser stå urørt, siden de må fylles ut manuelt", () => {
    expect(htmlTilRenTekst("<p>Hei {fornavn}</p><p>{#hvis avslag}Avslag{/hvis}</p>")).toBe(
      "Hei {fornavn}\n\n{#hvis avslag}Avslag{/hvis}",
    );
  });

  it("gjør harde mellomrom om til vanlige", () => {
    expect(htmlTilRenTekst("<p>Fra&nbsp;01.01.2024</p>")).toBe("Fra 01.01.2024");
  });

  it("kollapser tomme avsnitt i stedet for å dra med et gap på flere linjer", () => {
    expect(htmlTilRenTekst("<p>Før</p><p></p><p></p><p>Etter</p>")).toBe("Før\n\nEtter");
  });

  it("trimmer bort ledende og etterfølgende tomrom", () => {
    expect(htmlTilRenTekst("<p> Midt i </p>")).toBe("Midt i");
  });

  it("takler tekst uten blokktagger", () => {
    expect(htmlTilRenTekst("Bare tekst")).toBe("Bare tekst");
  });

  it("gir tom streng for tomt innhold", () => {
    expect(htmlTilRenTekst("")).toBe("");
  });
});
