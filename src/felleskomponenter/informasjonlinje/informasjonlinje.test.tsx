import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../melosyskodeverk";

vi.mock("./behandlingsmeny", () => ({
  default: () => <div>Behandlingsmeny</div>,
}));

vi.mock("./personlinje", () => ({
  default: ({ behandlingID }: any) => <div>Personlinje {behandlingID}</div>,
}));

vi.mock("./virksomhetlinje", () => ({
  default: ({ saksnummer }: any) => <div>Virksomhetlinje {saksnummer}</div>,
}));

// Importerer uconnected komponent via default export mock
vi.mock("react-redux", () => ({
  connect: () => (comp: any) => comp,
}));

import Informasjonlinje from "./informasjonlinje";

const { BRUKER, VIRKSOMHET } = MKV.Koder.aktoersroller;

describe("Informasjonlinje", () => {
  it("rendrer personlinje for BRUKER-rolle", () => {
    render(<Informasjonlinje behandlingID={1} saksnummer="123" hovedpartRolle={BRUKER} />);
    expect(screen.getByText("Personlinje 1")).toBeDefined();
    expect(screen.queryByText(/Virksomhetlinje/)).toBeNull();
  });

  it("rendrer virksomhetlinje for VIRKSOMHET-rolle", () => {
    render(<Informasjonlinje behandlingID={1} saksnummer="123" hovedpartRolle={VIRKSOMHET} />);
    expect(screen.getByText("Virksomhetlinje 123")).toBeDefined();
    expect(screen.queryByText(/Personlinje/)).toBeNull();
  });

  it("rendrer null når rolle er ukjent", () => {
    const { container } = render(<Informasjonlinje behandlingID={1} saksnummer="123" hovedpartRolle="UKJENT" />);
    expect(container.innerHTML).toBe("");
  });

  it("rendrer behandlingsmeny som standard", () => {
    render(<Informasjonlinje behandlingID={1} saksnummer="123" hovedpartRolle={BRUKER} />);
    expect(screen.getByText("Behandlingsmeny")).toBeDefined();
  });

  it("skjuler behandlingsmeny når visBehandlingsmeny=false", () => {
    render(<Informasjonlinje behandlingID={1} saksnummer="123" hovedpartRolle={BRUKER} visBehandlingsmeny={false} />);
    expect(screen.queryByText("Behandlingsmeny")).toBeNull();
  });
});
