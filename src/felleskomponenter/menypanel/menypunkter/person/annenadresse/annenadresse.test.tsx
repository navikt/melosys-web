import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-redux", () => ({
  connect: () => (comp: any) => comp,
}));

vi.mock("../../../../../kodeverk", () => ({
  Menypunkter: { Person: { undertitler: { annenAdresse: "Annen adresse" } } },
}));

vi.mock("../../editerbartElement", () => ({
  default: ({ tittel, harData, redigeringUtfortRender }: any) =>
    harData ? (
      <div>
        <span>{tittel}</span>
        {redigeringUtfortRender()}
      </div>
    ) : null,
}));

vi.mock("./utfyltadresse", () => ({
  default: ({ adresse }: any) => <div>Adresse: {adresse?.gateadresse}</div>,
}));

vi.mock("../../../../../ducks/form", () => ({
  formSelectors: {
    SoknadOppgittAdresseSelector: () => ({}),
    SoknadOppgittAdresseHarVerdierSelector: () => true,
  },
}));

import AnnenAdresse from "./annenadresse";

describe("AnnenAdresse", () => {
  it("returnerer null når alle verdier er undefined", () => {
    const { container } = render(
      <AnnenAdresse {...({ oppgittAdresse: { gate: undefined }, oppgittAdresseHarVerdier: false } as any)} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("rendrer adresse når data finnes", () => {
    render(
      <AnnenAdresse {...({ oppgittAdresse: { gateadresse: "Testgata 1" }, oppgittAdresseHarVerdier: true } as any)} />,
    );
    expect(screen.getByText("Annen adresse")).toBeDefined();
    expect(screen.getByText("Adresse: Testgata 1")).toBeDefined();
  });

  it("returnerer null når oppgittAdresseHarVerdier er false men verdier finnes", () => {
    const { container } = render(
      <AnnenAdresse {...({ oppgittAdresse: { gateadresse: "Testgata 1" }, oppgittAdresseHarVerdier: false } as any)} />,
    );
    expect(container.innerHTML).toBe("");
  });
});
