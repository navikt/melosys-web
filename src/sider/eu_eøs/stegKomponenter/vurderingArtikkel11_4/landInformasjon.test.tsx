import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../kodeverk", () => ({
  objektTilTerm: (obj: any) => obj?.term ?? "",
}));

vi.mock("../../../../utils/streng", () => ({
  arrayTilKonjunksjon: (arr: string[]) => arr.join(" og "),
  storeForbokstaverForLand: (land: string) => land.charAt(0).toUpperCase() + land.slice(1).toLowerCase(),
}));

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

vi.mock("../../../../ducks/avklartefakta", () => ({
  avklartefaktaSelectors: {
    AvklarteVirksomheterSelector: "AvklarteVirksomheterSelector",
    ArbeidslandKTSelector: "ArbeidslandKTSelector",
    BostedslandSelector: "BostedslandSelector",
  },
}));

import { useSelector } from "react-redux";
import LandInformasjon from "./landInformasjon";

describe("LandInformasjon", () => {
  it("rendrer arbeidsland, virksomhetsland og bostedsland", () => {
    vi.mocked(useSelector).mockImplementation((selector: any) => {
      if (selector === "AvklarteVirksomheterSelector") return [{ virksomhetId: "1", adresse: { land: "sverige" } }];
      if (selector === "ArbeidslandKTSelector") return [{ term: "Norge" }];
      if (selector === "BostedslandSelector") return { term: "Norge" };
      return undefined;
    });

    render(<LandInformasjon />);
    expect(screen.getByText("Arbeidsland er")).toBeDefined();
    expect(screen.getAllByText("Norge")).toHaveLength(2);
    expect(screen.getByText("Sverige")).toBeDefined();
    expect(screen.getByText("Søker er bosatt i")).toBeDefined();
  });

  it("håndterer virksomhet uten adresseland", () => {
    vi.mocked(useSelector).mockImplementation((selector: any) => {
      if (selector === "AvklarteVirksomheterSelector") return [{ virksomhetId: "1", adresse: {} }];
      if (selector === "ArbeidslandKTSelector") return [];
      if (selector === "BostedslandSelector") return { term: "Danmark" };
      return undefined;
    });

    render(<LandInformasjon />);
    expect(screen.getByText("Danmark")).toBeDefined();
  });
});
