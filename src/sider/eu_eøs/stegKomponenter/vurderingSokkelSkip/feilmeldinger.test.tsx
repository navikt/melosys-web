import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  Alert: ({ children, variant }: any) => <div data-variant={variant}>{children}</div>,
}));

vi.mock("../../../../kodeverk", () => ({
  Koder: {
    VurderingSokkelSkipTyper: {
      SKIP_ETT_LAND: "SKIP_ETT_LAND",
      SOKKEL_UTLAND: "SOKKEL_UTLAND",
    },
    SOKKEL: "SOKKEL",
    SKIP: "SKIP",
  },
}));

import { finnAktivFeilmelding, Feilmelding } from "./feilmeldinger";

describe("finnAktivFeilmelding", () => {
  const tomKonklusjon = { fakta: [] } as any;
  const tomListe: any[] = [];

  it("returnerer FLERE_ARBEIDSLAND_ERROR når det er flere arbeidsland", () => {
    const arbeidslandListe = [{ fakta: ["NO"] }, { fakta: ["SE"] }] as any[];
    const resultat = finnAktivFeilmelding(tomKonklusjon, tomListe, arbeidslandListe);
    expect(resultat).toBe("FLERE_ARBEIDSLAND_ERROR");
  });

  it("returnerer undefined når ingen feil", () => {
    const resultat = finnAktivFeilmelding(tomKonklusjon, tomListe, [{ fakta: ["NO"] }] as any[]);
    expect(resultat).toBeUndefined();
  });

  it("returnerer ULOGISK_KOMBINASJON_ERROR ved sokkel med skip-ett-land konklusjon", () => {
    const konklusjon = { fakta: ["SKIP_ETT_LAND"] } as any;
    const sokkelListe = [{ fakta: ["SOKKEL"] }] as any[];
    const resultat = finnAktivFeilmelding(konklusjon, sokkelListe, [{ fakta: ["NO"] }] as any[]);
    expect(resultat).toBe("ULOGISK_KOMBINASJON_ERROR");
  });
});

describe("Feilmelding", () => {
  it("rendrer ulogisk kombinasjon-feil", () => {
    render(<Feilmelding type="ULOGISK_KOMBINASJON_ERROR" />);
    expect(screen.getByText(/ulogisk/i)).toBeDefined();
  });

  it("rendrer flere arbeidsland-feil", () => {
    render(<Feilmelding type="FLERE_ARBEIDSLAND_ERROR" />);
    expect(screen.getByText(/mer enn ett arbeidssted/)).toBeDefined();
  });

  it("rendrer null for ukjent type", () => {
    const { container } = render(<Feilmelding type={undefined} />);
    expect(container.innerHTML).toBe("");
  });
});
