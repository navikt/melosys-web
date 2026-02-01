import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../../../kodeverk", () => ({
  Menypunkter: { Periode: { tittel: "Periode og land", undertitler: { periode: "Søknadsperiode" } } },
}));

vi.mock("./soknadsperiode", () => ({
  default: ({ tittel }: any) => <div>{tittel}</div>,
}));

vi.mock("./soknadslandvelger", () => ({
  default: () => <div>Landvelger</div>,
}));

vi.mock("./tittellinje", () => ({
  default: ({ tittel }: any) => <h2>{tittel}</h2>,
}));

import Periode from "./periode";

describe("Periode", () => {
  it("rendrer tittel, søknadsperiode og landvelger", () => {
    render(
      <Periode
        visArbeidsforholdRolleEtiketter={false}
        redigerbart={true}
        lagreSoknadOgOppfriskSaksopplysninger={vi.fn()}
      />,
    );
    expect(screen.getByText("Periode og land")).toBeDefined();
    expect(screen.getByText("Søknadsperiode")).toBeDefined();
    expect(screen.getByText("Landvelger")).toBeDefined();
  });
});
