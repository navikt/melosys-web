import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../kodeverk", () => ({
  kodeTilTerm: (kode: string) => (kode === "SE" ? "Sverige" : kode),
}));

vi.mock("../../../../melosyskodeverk", () => ({
  default: { Kodekombinasjoner: { unikeAvtaleland: [{ kode: "SE", term: "Sverige" }] } },
}));

vi.mock("../../../../utils/land", () => ({
  sorterLandOgGjørOmTilStoreForbokstaver: (land: any[]) => land,
}));

vi.mock("../../../../felleskomponenter/skjema", () => ({
  LandVelger: ({ label }: any) => <div>{label}</div>,
}));

import AvsenderUtenlandskTrygdemyndighet from "./avsenderUtenlandskTrygdemyndighet";

describe("AvsenderUtenlandskTrygdemyndighet", () => {
  it("rendrer landvelger med label", () => {
    render(<AvsenderUtenlandskTrygdemyndighet fullmektigLandEndret={vi.fn()} />);
    expect(screen.getByText("Land")).toBeDefined();
    expect(screen.getByText("Avsender:")).toBeDefined();
  });

  it("viser trygdemyndighet-tekst når landkode er satt", () => {
    render(<AvsenderUtenlandskTrygdemyndighet utenlandskTrygdemyndighetLandkode="SE" fullmektigLandEndret={vi.fn()} />);
    expect(screen.getByText("Trygdemyndighet i Sverige")).toBeDefined();
  });

  it("viser ikke trygdemyndighet-tekst når landkode mangler", () => {
    render(<AvsenderUtenlandskTrygdemyndighet fullmektigLandEndret={vi.fn()} />);
    expect(screen.queryByText(/Trygdemyndighet i/)).toBeNull();
  });
});
