import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import TekstblokkerListe from "./tekstblokkerListe";
import { useTekstblokkHistorikk } from "../../../services/api/tekstblokker";
import { TekstblokkOversikt, TekstblokkVersjon } from "../../../services/modules/tekstblokker";

// Forhåndsvisningen i den utvidbare raden trenger redux; her handler det om selve raden.
vi.mock("../../../felleskomponenter/htmlEditor/tekstblokkForhandsvisning", () => ({
  default: () => null,
}));

vi.mock("../../../services/api/tekstblokker", () => ({
  useTekstblokkHistorikk: vi.fn(() => ({ data: [], isLoading: false, error: null })),
}));

const blokk = (avgrensning: Partial<TekstblokkOversikt> = {}): TekstblokkOversikt => ({
  id: 1,
  tittel: "Om utsending",
  innhold: "<p>Tekst</p>",
  type: "TEKSTBLOKK",
  tags: ["usa"],
  sakstyper: [],
  behandlingstemaer: [],
  status: "PUBLISERT",
  endretDato: "2026-01-01T00:00:00Z",
  endretAv: "Z123456",
  endretAvNavn: null,
  ...avgrensning,
});

const visListe = (blokker: TekstblokkOversikt[], props: Partial<Parameters<typeof TekstblokkerListe>[0]> = {}) =>
  render(
    <TekstblokkerListe
      blokker={blokker}
      utvidedeIder={new Set()}
      onToggleUtvidet={vi.fn()}
      onRediger={vi.fn()}
      onSlett={vi.fn()}
      onPubliser={vi.fn()}
      {...props}
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

describe("TekstblokkerListe – utkast", () => {
  it("merker utkast og tilbyr publisering", async () => {
    const onPubliser = vi.fn();
    const utkast = blokk({ status: "UTKAST" });

    visListe([utkast], { onPubliser });
    await userEvent.click(screen.getByRole("button", { name: "Publiser" }));

    expect(screen.getByText("Utkast")).toBeDefined();
    expect(onPubliser).toHaveBeenCalledWith(utkast);
  });

  it("viser verken merke eller publiseringsknapp for en publisert blokk", () => {
    visListe([blokk()]);

    expect(screen.queryByText("Utkast")).toBeNull();
    expect(screen.queryByRole("button", { name: "Publiser" })).toBeNull();
  });
});

describe("TekstblokkerListe – historikk", () => {
  const versjon = (versjonsnr: number, endringstype: TekstblokkVersjon["endringstype"]): TekstblokkVersjon => ({
    versjon: versjonsnr,
    gyldigFra: "2026-01-02T10:00:00",
    gyldigTil: versjonsnr === 1 ? "2026-01-03T12:00:00" : null,
    endretAv: "Z123456",
    endretAvNavn: "Kari Saksbehandler",
    endringstype,
    tittel: "Om utsending",
    innhold: "<p>Tekst</p>",
  });

  it("åpner raden og viser versjonene når historikk velges", async () => {
    vi.mocked(useTekstblokkHistorikk).mockReturnValue({
      data: [versjon(1, "OPPRETTET"), versjon(2, "ENDRET")],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useTekstblokkHistorikk>);
    const onToggleUtvidet = vi.fn();

    visListe([blokk()], { onToggleUtvidet, utvidedeIder: new Set([1]) });
    await userEvent.click(screen.getByRole("button", { name: "Historikk" }));

    // Raden var åpen fra før, så den skal ikke lukkes av historikk-knappen.
    expect(onToggleUtvidet).not.toHaveBeenCalled();
    expect(screen.getByRole("columnheader", { name: "Versjon" })).toBeDefined();
    expect(screen.getByText("Opprettet")).toBeDefined();
    expect(screen.getByText("Endret")).toBeDefined();
    expect(screen.getByText("02.01.2026 10:00 – nå")).toBeDefined();
    expect(screen.getAllByText("Kari Saksbehandler")).toHaveLength(2);
  });

  it("åpner raden når historikk velges på en lukket rad", async () => {
    const onToggleUtvidet = vi.fn();

    visListe([blokk()], { onToggleUtvidet });
    await userEvent.click(screen.getByRole("button", { name: "Historikk" }));

    expect(onToggleUtvidet).toHaveBeenCalledWith(1);
  });

  it("viser ingen historikk før den er valgt", () => {
    visListe([blokk()], { utvidedeIder: new Set([1]) });

    expect(screen.queryByRole("columnheader", { name: "Versjon" })).toBeNull();
  });

  it("nullstiller historikkvalget når raden lukkes, så ny åpning viser forhåndsvisningen", async () => {
    // Utvidelsen styres av siden, så testen holder den samme tilstanden som den gjør.
    function Vert() {
      const [utvidedeIder, setUtvidedeIder] = useState<Set<number>>(new Set());
      const toggle = (id: number) =>
        setUtvidedeIder((forrige) => (forrige.has(id) ? new Set<number>() : new Set([id])));
      return (
        <TekstblokkerListe
          blokker={[blokk()]}
          utvidedeIder={utvidedeIder}
          onToggleUtvidet={toggle}
          onRediger={vi.fn()}
          onSlett={vi.fn()}
          onPubliser={vi.fn()}
        />
      );
    }

    render(<Vert />);
    await userEvent.click(screen.getByRole("button", { name: "Historikk" }));
    expect(screen.getByRole("button", { name: "Historikk" }).getAttribute("aria-pressed")).toBe("true");

    await userEvent.click(screen.getByRole("button", { name: "Vis mindre" }));
    // Første treff er radens egen utvid-knapp; historikktabellen har sine egne.
    await userEvent.click(screen.getAllByRole("button", { name: "Vis mer" })[0]);

    expect(screen.getByRole("button", { name: "Historikk" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.queryByRole("columnheader", { name: "Versjon" })).toBeNull();
  });
});
