import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import TekstblokkerListe from "./tekstblokkerListe";
import { useTekstblokkHistorikk } from "../../../services/api/tekstblokker";
import { TekstblokkOversikt, TekstblokkVersjon } from "../../../services/modules/tekstblokker";
import { tekstblokkOversikt } from "../../../services/modules/tekstblokkTestdata";

// Forhåndsvisningen i den utvidbare raden trenger redux; her handler det om selve raden.
vi.mock("../../../felleskomponenter/htmlEditor/tekstblokkForhandsvisning", () => ({
  default: () => null,
}));

vi.mock("../../../services/api/tekstblokker", () => ({
  useTekstblokkHistorikk: vi.fn(() => ({ data: [], isLoading: false, error: null })),
}));

const blokk = (avgrensning: Partial<TekstblokkOversikt> = {}): TekstblokkOversikt =>
  tekstblokkOversikt({ tittel: "Om utsending", tags: ["usa"], ...avgrensning });

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

  it("viser maks tre termer og samler resten i en «+N»-tag med termene i tooltipen", () => {
    visListe([
      blokk({
        sakstyper: ["EU_EOS", "TRYGDEAVTALE", "FTRL"],
        behandlingstemaer: ["ARBEID_KUN_NORGE", "IKKE_YRKESAKTIV"],
      }),
    ]);

    expect(gjelderCelle().textContent).toBe("EU/EØS-landAvtalelandUtenfor avtaleland+2");
    const skjulte = screen.getByText("+2");
    expect(skjulte.getAttribute("title")).toBe("Arbeid kun i Norge, Ikke yrkesaktiv");
    expect(skjulte.getAttribute("aria-label")).toBe("Arbeid kun i Norge, Ikke yrkesaktiv");
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
  const versjon = (
    versjonsnr: number,
    endringstype: TekstblokkVersjon["endringstype"],
    overstyringer: Partial<TekstblokkVersjon> = {},
  ): TekstblokkVersjon => ({
    versjon: versjonsnr,
    gyldigFra: "2026-01-02T10:00:00",
    gyldigTil: versjonsnr === 1 ? "2026-01-03T12:00:00" : null,
    endretAv: "Z123456",
    endretAvNavn: "Kari Saksbehandler",
    endringstype,
    tittel: "Om utsending",
    innhold: "<p>Tekst</p>",
    ...overstyringer,
  });

  const visHistorikk = async (versjoner: TekstblokkVersjon[]) => {
    vi.mocked(useTekstblokkHistorikk).mockReturnValue({
      data: versjoner,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useTekstblokkHistorikk>);

    visListe([blokk()], { utvidedeIder: new Set([1]) });
    await userEvent.click(screen.getByRole("button", { name: "Historikk" }));
  };

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

  it("lister hvilke felter som skiller versjonen fra den forrige", async () => {
    await visHistorikk([
      versjon(1, "OPPRETTET", { tags: ["usa"], sakstyper: [], behandlingstemaer: [], status: "UTKAST" }),
      versjon(2, "ENDRET", {
        tittel: "Om utsending til USA",
        tags: ["usa", "skip"],
        sakstyper: ["EU_EOS"],
        behandlingstemaer: [],
        status: "PUBLISERT",
      }),
    ]);

    expect(screen.getByText("Endret: tittel, tags, avgrensning, status")).toBeDefined();
  });

  it("sier ingenting om endring på den første versjonen", async () => {
    await visHistorikk([versjon(1, "OPPRETTET", { tags: [], sakstyper: [], behandlingstemaer: [] })]);

    expect(screen.queryByText(/^Endret: /)).toBeNull();
  });

  it("nevner kun innhold når bare innholdet er endret", async () => {
    await visHistorikk([
      versjon(1, "OPPRETTET", { tags: ["usa"], sakstyper: ["EU_EOS"], behandlingstemaer: [] }),
      versjon(2, "ENDRET", {
        innhold: "<p>Ny tekst</p>",
        tags: ["usa"],
        sakstyper: ["EU_EOS"],
        behandlingstemaer: [],
      }),
    ]);

    expect(screen.getByText("Endret: innhold")).toBeDefined();
  });

  it("påstår ingen endring i felter api-et ikke har levert", async () => {
    // Eldre versjonsrader mangler avgrensning, tags og status – da vet vi ingenting om dem.
    await visHistorikk([versjon(1, "OPPRETTET"), versjon(2, "ENDRET", { innhold: "<p>Ny tekst</p>" })]);

    expect(screen.getByText("Endret: innhold")).toBeDefined();
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
