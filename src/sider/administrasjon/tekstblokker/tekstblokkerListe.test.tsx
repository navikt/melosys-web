import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import TekstblokkerListe from "./tekstblokkerListe";
import { TekstblokkOversikt } from "../../../services/modules/tekstblokker";

// Forhåndsvisningen i den utvidbare raden trenger redux; her handler det om selve raden.
vi.mock("../../../felleskomponenter/htmlEditor/tekstblokkForhandsvisning", () => ({
  default: () => null,
}));

const blokk = (avgrensning: Partial<TekstblokkOversikt> = {}): TekstblokkOversikt => ({
  id: 1,
  tittel: "Om utsending",
  innhold: "<p>Tekst</p>",
  type: "TEKSTBLOKK",
  tags: ["usa"],
  sakstyper: [],
  behandlingstemaer: [],
  endretDato: "2026-01-01T00:00:00Z",
  endretAv: "Z123456",
  endretAvNavn: null,
  ...avgrensning,
});

const visListe = (blokker: TekstblokkOversikt[]) =>
  render(
    <TekstblokkerListe
      blokker={blokker}
      utvidedeIder={new Set()}
      onToggleUtvidet={vi.fn()}
      onRediger={vi.fn()}
      onSlett={vi.fn()}
    />,
  );

// Avgrensningen ligger i «Gjelder»-kolonnen; tagene i sin egen.
const gjelderCelle = () => {
  const kolonner = screen.getAllByRole("columnheader").map((celle) => celle.textContent);
  return screen.getAllByRole("cell")[kolonner.indexOf("Gjelder")];
};

describe("TekstblokkerListe – avgrensning", () => {
  it("viser termene for avgrensningen i «Gjelder»-kolonnen, ikke blant tagene", () => {
    visListe([blokk({ sakstyper: ["EU_EOS"], behandlingstemaer: ["ARBEID_KUN_NORGE"] })]);

    expect(screen.getByText("usa")).toBeDefined();
    expect(screen.getByRole("columnheader", { name: "Gjelder" })).toBeDefined();
    expect(gjelderCelle().textContent).toBe("EU/EØS-landArbeid kun i Norge");
  });

  it("viser «Alle» når blokken ikke er avgrenset", () => {
    visListe([blokk()]);

    expect(screen.getByText("usa")).toBeDefined();
    expect(gjelderCelle().textContent).toBe("Alle");
  });

  it("faller tilbake til koden for en ukjent avgrensningsverdi", () => {
    visListe([blokk({ sakstyper: ["UKJENT_KODE"] })]);

    expect(screen.getByText("UKJENT_KODE")).toBeDefined();
  });
});
