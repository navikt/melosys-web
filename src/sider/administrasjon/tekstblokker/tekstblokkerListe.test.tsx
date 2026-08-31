import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
      historikkId={null}
      onToggleUtvidet={vi.fn()}
      onToggleHistorikk={vi.fn()}
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
    visListe([blokk({ sakstyper: ["EU_EOS"], behandlingstemaer: [] })]);

    expect(screen.getByText("usa")).toBeDefined();
    expect(screen.getByRole("columnheader", { name: "Gjelder" })).toBeDefined();
    expect(gjelderCelle().textContent).toBe("EU/EØS-land");
  });

  it("tar sakstema med i «Gjelder», mellom sakstype og behandlingstema", () => {
    visListe([blokk({ sakstyper: ["EU_EOS"], sakstemaer: ["UNNTAK"], behandlingstemaer: ["ARBEID_KUN_NORGE"] })], {
      utvidedeIder: new Set([1]),
    });

    expect(screen.getByText("Gjelder:")).toBeDefined();
    expect(screen.getByText("Unntak")).toBeDefined();
  });

  it("viser «Alle» når blokken ikke er avgrenset", () => {
    visListe([blokk()]);

    expect(screen.getByText("usa")).toBeDefined();
    expect(gjelderCelle().textContent).toBe("Alle");
  });

  it("viser én term og samler resten i en «+N»-knapp med termene i tooltipen", () => {
    visListe([
      blokk({
        sakstyper: ["EU_EOS", "TRYGDEAVTALE"],
        behandlingstemaer: ["ARBEID_KUN_NORGE"],
      }),
    ]);

    expect(gjelderCelle().textContent).toBe("EU/EØS-land+2");
    const skjulte = screen.getByRole("button", { name: "Avtaleland, Arbeid kun i Norge" });
    expect(skjulte.textContent).toBe("+2");
    expect(skjulte.getAttribute("title")).toBe("Avtaleland, Arbeid kun i Norge");
  });

  it("utvider raden og viser alle gjelder-termene når «+N» klikkes", async () => {
    const onToggleUtvidet = vi.fn();

    visListe([blokk({ sakstyper: ["EU_EOS", "TRYGDEAVTALE"], behandlingstemaer: ["ARBEID_KUN_NORGE"] })], {
      onToggleUtvidet,
    });
    await userEvent.click(screen.getByRole("button", { name: "Avtaleland, Arbeid kun i Norge" }));

    expect(onToggleUtvidet).toHaveBeenCalledWith(1);
  });

  it("lar «+N» stå som en ren åpne-knapp: en utvidet rad kollapser ikke", async () => {
    const onToggleUtvidet = vi.fn();

    visListe([blokk({ sakstyper: ["EU_EOS", "TRYGDEAVTALE"], behandlingstemaer: ["ARBEID_KUN_NORGE"] })], {
      utvidedeIder: new Set([1]),
      onToggleUtvidet,
    });
    await userEvent.click(screen.getByRole("button", { name: "Avtaleland, Arbeid kun i Norge" }));

    expect(onToggleUtvidet).not.toHaveBeenCalled();
  });

  it("viser alle termene med ledetekst i den utvidede raden", () => {
    visListe([blokk({ sakstyper: ["EU_EOS", "TRYGDEAVTALE"], behandlingstemaer: ["ARBEID_KUN_NORGE"] })], {
      utvidedeIder: new Set([1]),
    });

    expect(screen.getByText("Gjelder:")).toBeDefined();
    // Første term står også i kolonnen; de skjulte finnes kun i utvidelsen.
    expect(screen.getAllByText("EU/EØS-land")).toHaveLength(2);
    expect(screen.getByText("Avtaleland")).toBeDefined();
    expect(screen.getByText("Arbeid kun i Norge")).toBeDefined();
  });

  it("viser ingen gjelder-ledetekst i utvidelsen når blokken ikke er avgrenset", () => {
    visListe([blokk()], { utvidedeIder: new Set([1]) });

    expect(screen.queryByText("Gjelder:")).toBeNull();
  });

  it("faller tilbake til koden for en ukjent avgrensningsverdi", () => {
    visListe([blokk({ sakstyper: ["UKJENT_KODE"] })]);

    // Termen står både i kolonnen og i radens utvidede innhold.
    expect(screen.getAllByText("UKJENT_KODE").length).toBeGreaterThan(0);
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
    tags: [],
    sakstyper: [],
    sakstemaer: [],
    behandlingstemaer: [],
    status: "PUBLISERT",
    ...overstyringer,
  });

  const visHistorikk = (versjoner: TekstblokkVersjon[]) => {
    vi.mocked(useTekstblokkHistorikk).mockReturnValue({
      data: versjoner,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useTekstblokkHistorikk>);

    visListe([blokk()], { utvidedeIder: new Set([1]), historikkId: 1 });
  };

  it("viser versjonene i raden som er valgt for historikk", () => {
    visHistorikk([versjon(1, "OPPRETTET"), versjon(2, "ENDRET")]);

    expect(screen.getByRole("columnheader", { name: "Versjon" })).toBeDefined();
    expect(screen.getByText("Opprettet")).toBeDefined();
    expect(screen.getByText("Endret")).toBeDefined();
    expect(screen.getByText("02.01.2026 10:00 – nå")).toBeDefined();
    expect(screen.getAllByText("Kari Saksbehandler")).toHaveLength(2);
  });

  it("lister hvilke felter som skiller versjonen fra den forrige, med detaljene", () => {
    visHistorikk([
      versjon(1, "OPPRETTET", { tags: ["usa"], sakstyper: [], behandlingstemaer: [], status: "UTKAST" }),
      versjon(2, "ENDRET", {
        tittel: "Om utsending til USA",
        tags: ["usa", "skip"],
        sakstyper: ["EU_EOS"],
        behandlingstemaer: [],
        status: "PUBLISERT",
      }),
    ]);

    expect(
      screen.getByText("Endret: tittel, tags (+skip), avgrensning (+EU/EØS-land), status (Utkast → Publisert)"),
    ).toBeDefined();
  });

  it("viser lagt til før fjernet i avgrensningen, på tvers av sakstype og behandlingstema", () => {
    visHistorikk([
      versjon(1, "OPPRETTET", { sakstyper: ["EU_EOS"], behandlingstemaer: [] }),
      versjon(2, "ENDRET", { sakstyper: [], behandlingstemaer: ["ARBEID_KUN_NORGE"] }),
    ]);

    expect(screen.getByText("Endret: avgrensning (+Arbeid kun i Norge, −EU/EØS-land)")).toBeDefined();
  });

  it("viser fjernede tags med minus", () => {
    visHistorikk([versjon(1, "OPPRETTET", { tags: ["usa", "skip"] }), versjon(2, "ENDRET", { tags: ["skip"] })]);

    expect(screen.getByText("Endret: tags (−usa)")).toBeDefined();
  });

  it("sier ingenting om endring på den første versjonen", () => {
    visHistorikk([versjon(1, "OPPRETTET", { tags: [], sakstyper: [], behandlingstemaer: [] })]);

    expect(screen.queryByText(/^Endret: /)).toBeNull();
  });

  it("nevner kun innhold når bare innholdet er endret", () => {
    visHistorikk([
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

  it("nevner bare feltene som faktisk skiller seg", () => {
    visHistorikk([versjon(1, "OPPRETTET"), versjon(2, "ENDRET", { innhold: "<p>Ny tekst</p>" })]);

    expect(screen.getByText("Endret: innhold")).toBeDefined();
  });

  it("sorterer på versjonsnummer uavhengig av rekkefølgen fra api-et", () => {
    visHistorikk([versjon(2, "ENDRET", { status: "PUBLISERT" }), versjon(1, "OPPRETTET", { status: "UTKAST" })]);

    expect(screen.getByText("Endret: status (Utkast → Publisert)")).toBeDefined();
    const historikktabell = screen.getByRole("columnheader", { name: "Versjon" }).closest("table")!;
    const versjonsnumre = within(historikktabell)
      .getAllByRole("row")
      .slice(1)
      .map((rad) => rad.querySelectorAll("td")[1].textContent);
    expect(versjonsnumre).toEqual(["2", "1"]);
  });

  it("sier ingenting om statusendring på den opprettede versjonen", () => {
    visHistorikk([versjon(2, "ENDRET", { status: "PUBLISERT" }), versjon(1, "OPPRETTET", { status: "UTKAST" })]);

    expect(screen.queryByText(/Publisert → Utkast/)).toBeNull();
  });

  it("melder fra om historikkvalget i stedet for å styre det selv", async () => {
    const onToggleHistorikk = vi.fn();

    visListe([blokk()], { onToggleHistorikk });
    await userEvent.click(screen.getByRole("button", { name: "Historikk" }));

    expect(onToggleHistorikk).toHaveBeenCalledWith(1);
  });

  it("viser ingen historikk før den er valgt", () => {
    visListe([blokk()], { utvidedeIder: new Set([1]) });

    expect(screen.queryByRole("columnheader", { name: "Versjon" })).toBeNull();
  });
});
