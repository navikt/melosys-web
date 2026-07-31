import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import PlaceholderKatalog from "./placeholderKatalog";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { useBetingelseKatalog, usePlaceholderKatalog } from "../../../services/api/placeholdere";

vi.mock("../../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

vi.mock("../../../services/api/placeholdere", () => ({
  usePlaceholderKatalog: vi.fn(),
  useBetingelseKatalog: vi.fn(),
}));

const katalog = [
  {
    nokkel: "soker-navn",
    visningsnavn: "Søkers navn",
    beskrivelse: "Fullt navn på søker",
    eksempel: "Ola Nordmann",
    sakstyper: ["FTRL"],
  },
];

const betingelser = [
  {
    nokkel: "delvis-innvilgelse",
    visningsnavn: "Delvis innvilgelse",
    beskrivelse: "Utlandet godtok avtalen delvis",
    sakstyper: ["FTRL"],
  },
];

const mockKatalog = (verdi: object) => vi.mocked(usePlaceholderKatalog).mockReturnValue(verdi as any);

const mockBetingelser = (data: object[]) => vi.mocked(useBetingelseKatalog).mockReturnValue({ data } as any);

describe("PlaceholderKatalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBetingelser([]);
  });

  it("viser visningsnavn, nøkkel og eksempel når togglen er på", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: katalog, error: null });

    render(<PlaceholderKatalog />);

    expect(screen.getByText("Søkers navn")).toBeDefined();
    expect(screen.getByText("{soker-navn}")).toBeDefined();
    expect(screen.getByText("Fullt navn på søker")).toBeDefined();
    expect(screen.getByText("Ola Nordmann")).toBeDefined();
  });

  it("forklarer valgtoken-syntaksen", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: katalog, error: null });

    render(<PlaceholderKatalog />);

    expect(screen.getByText(/\{velg:Alternativ A\|Alternativ B\}/)).toBeDefined();
  });

  it("viser betingelsesseksjonen med nøkkel, visningsnavn og beskrivelse", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: katalog, error: null });
    mockBetingelser(betingelser);

    render(<PlaceholderKatalog />);

    expect(screen.getByText("Betingelser")).toBeDefined();
    expect(screen.getByText("Delvis innvilgelse")).toBeDefined();
    expect(screen.getByText("{#hvis delvis-innvilgelse}")).toBeDefined();
    expect(screen.getByText("Utlandet godtok avtalen delvis")).toBeDefined();
  });

  it("forklarer hvis-syntaksen i betingelsesseksjonen", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: katalog, error: null });
    mockBetingelser(betingelser);

    render(<PlaceholderKatalog />);

    expect(screen.getByText(/\{#hvis nokkel\}/)).toBeDefined();
    expect(screen.getByText(/\{\/hvis\}/)).toBeDefined();
  });

  it("skjuler betingelsesseksjonen når api-et ikke leverer betingelser", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: katalog, error: null });

    render(<PlaceholderKatalog />);

    expect(screen.queryByText("Betingelser")).toBeNull();
  });

  it("rendrer ingenting når togglen er av", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    mockKatalog({ data: katalog, error: null });

    const { container } = render(<PlaceholderKatalog />);

    expect(container.textContent).toBe("");
    expect(usePlaceholderKatalog).not.toHaveBeenCalled();
  });

  it("rendrer ingenting når hentingen feiler", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: undefined, error: new Error("nedetid") });

    const { container } = render(<PlaceholderKatalog />);

    expect(container.textContent).toBe("");
  });

  it("rendrer ingenting når katalogen er tom", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: [], error: null });

    const { container } = render(<PlaceholderKatalog />);

    expect(container.textContent).toBe("");
  });
});
