import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-redux", () => ({
  useSelector: vi.fn(() => 1),
}));

vi.mock("../../ducks/behandlinger", () => ({
  behandlingerSelectors: { BehandlingIDSelector: () => 1 },
}));

let mockPersonopplysninger: any = null;
vi.mock("../informasjonlinje/useHentpersonopplysninger", () => ({
  default: () => mockPersonopplysninger,
}));

vi.mock("../../utils", () => ({
  _isEmpty: (arr: any) => !arr || arr.length === 0,
}));

vi.mock("../../navFrontend", () => ({
  Alert: ({ children, variant }: any) => (
    <div data-variant={variant} role="alert">
      {children}
    </div>
  ),
}));

import StatsborgerskapFeil from "./statsborgerskapFeil";

describe("StatsborgerskapFeil", () => {
  it("returnerer null når personopplysninger mangler", () => {
    mockPersonopplysninger = null;
    const { container } = render(<StatsborgerskapFeil className="test" />);
    expect(container.innerHTML).toBe("");
  });

  it("returnerer null for gyldig statsborgerskap", () => {
    mockPersonopplysninger = { statsborgerskap: ["NOR"] };
    const { container } = render(<StatsborgerskapFeil className="test" />);
    expect(container.innerHTML).toBe("");
  });

  it("viser advarsel for UOPPGITT statsborgerskap", () => {
    mockPersonopplysninger = { statsborgerskap: ["UOPPGITT"] };
    render(<StatsborgerskapFeil className="test" />);
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText(/Statsborgerskapet er ukjent/)).toBeDefined();
  });

  it("viser advarsel for tomt statsborgerskap", () => {
    mockPersonopplysninger = { statsborgerskap: [] };
    render(<StatsborgerskapFeil className="test" />);
    expect(screen.getByRole("alert")).toBeDefined();
  });

  it("viser advarsel for UKJENT statsborgerskap", () => {
    mockPersonopplysninger = { statsborgerskap: ["ukjent"] };
    render(<StatsborgerskapFeil className="test" />);
    expect(screen.getByRole("alert")).toBeDefined();
  });
});
