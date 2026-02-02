import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("./hentStatsborgerskap.generated", () => ({
  useHentStatsborgerskapQuery: vi.fn(),
}));

vi.mock("./statsborgerskapTable", () => ({
  default: ({ statsborgerskapList, historisk }: any) => (
    <div>
      Tabell {historisk ? "historisk" : "aktiv"} antall={statsborgerskapList.length}
    </div>
  ),
}));

import StatsborgerskapTableContainer from "./statsborgerskapTableContainer";
import { useHentStatsborgerskapQuery } from "./hentStatsborgerskap.generated";

describe("StatsborgerskapTableContainer", () => {
  it("viser feilmelding ved error", () => {
    vi.mocked(useHentStatsborgerskapQuery).mockReturnValue({ loading: false, error: true, data: undefined } as any);
    render(<StatsborgerskapTableContainer behandlingID={1} />);
    expect(screen.getByText("Kunne ikke hente statsborgerskap!")).toBeDefined();
  });

  it("viser laster-tekst ved loading", () => {
    vi.mocked(useHentStatsborgerskapQuery).mockReturnValue({ loading: true, error: undefined, data: undefined } as any);
    render(<StatsborgerskapTableContainer behandlingID={1} />);
    expect(screen.getByText("Laster statsborgerskap...")).toBeDefined();
  });

  it("rendrer kun aktiv tabell når ingen historiske", () => {
    vi.mocked(useHentStatsborgerskapQuery).mockReturnValue({
      loading: false,
      error: undefined,
      data: {
        hentSaksopplysninger: {
          persondata: {
            statsborgerskap: [{ land: "Norge", erHistorisk: false }],
          },
        },
      },
    } as any);
    render(<StatsborgerskapTableContainer behandlingID={1} />);
    expect(screen.getByText(/Tabell aktiv antall=1/)).toBeDefined();
    expect(screen.queryByText(/historisk/)).toBeNull();
  });

  it("rendrer både aktiv og historisk tabell", () => {
    vi.mocked(useHentStatsborgerskapQuery).mockReturnValue({
      loading: false,
      error: undefined,
      data: {
        hentSaksopplysninger: {
          persondata: {
            statsborgerskap: [
              { land: "Norge", erHistorisk: false },
              { land: "Sverige", erHistorisk: true },
            ],
          },
        },
      },
    } as any);
    render(<StatsborgerskapTableContainer behandlingID={1} />);
    expect(screen.getByText(/Tabell aktiv antall=1/)).toBeDefined();
    expect(screen.getByText(/Tabell historisk antall=1/)).toBeDefined();
  });
});
