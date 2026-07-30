import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import PlaceholderKatalog from "./placeholderKatalog";
import useFeatureToggle from "../../../featuretoggle/useFeatureToggle";
import { usePlaceholderKatalog } from "../../../services/api/placeholdere";

vi.mock("../../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

vi.mock("../../../services/api/placeholdere", () => ({
  usePlaceholderKatalog: vi.fn(),
}));

const katalog = [
  {
    nokkel: "sokerNavn",
    visningsnavn: "Søkers navn",
    beskrivelse: "Fullt navn på søker",
    eksempel: "Ola Nordmann",
    sakstyper: ["FTRL"],
  },
];

const mockKatalog = (verdi: object) => vi.mocked(usePlaceholderKatalog).mockReturnValue(verdi as any);

describe("PlaceholderKatalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("viser visningsnavn, nøkkel og eksempel når togglen er på", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    mockKatalog({ data: katalog, error: null });

    render(<PlaceholderKatalog />);

    expect(screen.getByText("Søkers navn")).toBeDefined();
    expect(screen.getByText("{sokerNavn}")).toBeDefined();
    expect(screen.getByText("Fullt navn på søker")).toBeDefined();
    expect(screen.getByText("Ola Nordmann")).toBeDefined();
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
