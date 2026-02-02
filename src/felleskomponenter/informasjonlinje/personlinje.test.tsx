import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../utils/streng", () => ({
  separerListeMedBindestrek: (list: string[]) => list.join(" - "),
}));

vi.mock("../../resources/images", () => ({
  Kjoenn: ({ kjoenn }: any) => <span>Kjønn: {kjoenn}</span>,
  Kors: () => <span>†</span>,
}));

vi.mock("./useHentpersonopplysninger", () => ({
  default: vi.fn(),
}));

vi.mock("../kopierbarTekst", () => ({
  default: ({ children }: any) => <span>{children}</span>,
}));

import Personlinje from "./personlinje";
import useHentPersonopplysninger from "./useHentpersonopplysninger";

describe("Personlinje", () => {
  it("rendrer ingenting når personopplysninger er null", () => {
    vi.mocked(useHentPersonopplysninger).mockReturnValue(null);
    const { container } = render(<Personlinje behandlingID={1} />);
    expect(container.innerHTML).toBe("");
  });

  it("rendrer navn, fnr, statsborgerskap og sivilstand", () => {
    vi.mocked(useHentPersonopplysninger).mockReturnValue({
      navn: "Ola Nordmann",
      fnr: "12345678901",
      kjoenn: "MANN",
      statsborgerskap: ["Norge"],
      sivilstand: "Gift",
      erDoed: false,
    } as any);
    render(<Personlinje behandlingID={1} />);
    expect(screen.getByText("Ola Nordmann")).toBeDefined();
    expect(screen.getByText("12345678901")).toBeDefined();
    expect(screen.getByText("Norge")).toBeDefined();
    expect(screen.getByText("Gift")).toBeDefined();
  });

  it("viser Død-markering når erDoed er true", () => {
    vi.mocked(useHentPersonopplysninger).mockReturnValue({
      navn: "Kari",
      fnr: "111",
      kjoenn: "KVINNE",
      statsborgerskap: ["Sverige"],
      sivilstand: "Ugift",
      erDoed: true,
    } as any);
    render(<Personlinje behandlingID={2} />);
    expect(screen.getByText("(Død)")).toBeDefined();
  });

  it("dedupliserer statsborgerskap", () => {
    vi.mocked(useHentPersonopplysninger).mockReturnValue({
      navn: "Test",
      fnr: "222",
      kjoenn: "MANN",
      statsborgerskap: ["Norge", "Norge"],
      sivilstand: "Gift",
      erDoed: false,
    } as any);
    render(<Personlinje behandlingID={3} />);
    expect(screen.getByText("Norge")).toBeDefined();
  });
});
