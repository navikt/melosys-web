import MedlemskapsPerioderTabell from "./medlemskapsPerioderTabell";
import { render, screen } from "@testing-library/react";

describe("MedlemskapsPerioderTabell", () => {
  it("ikke rendrer tabell når perioder prop er undefined", () => {
    render(<MedlemskapsPerioderTabell />);
    expect(screen.queryByText(/Medlemskap/i)).toBeNull();
    expect(screen.queryByText(/Dekning/i)).toBeNull();
  });

  it("rendrer tabell med data", () => {
    const perioder = [{ fom: "2022-01-01", tom: "2022-12-31", trygdedekning: "Full" }];
    render(<MedlemskapsPerioderTabell perioder={perioder} />);
    expect(screen.getByText(/Medlemskap/i)).toBeInTheDocument();
    expect(screen.getByText(/Dekning/i)).toBeInTheDocument();
  });

  it("rendrer tabell med flere perioder", () => {
    const perioder = [
      { fom: "2022-01-01", tom: "2022-12-31", trygdedekning: "Full" },
      { fom: "2023-01-01", tom: "2023-12-31", trygdedekning: "Delvis" },
    ];
    render(<MedlemskapsPerioderTabell perioder={perioder} />);
    const rows = screen.getAllByRole("row");
    expect(rows.length - 1).toBe(perioder.length); // -1 for header
  });

  it("formaterer og viser riktig fom og tom datoer", () => {
    const perioder = [{ fom: "2022-01-01", tom: "2022-12-31", trygdedekning: "Full" }];
    render(<MedlemskapsPerioderTabell perioder={perioder} />);
    expect(screen.getByText("01.01.2022 - 31.12.2022")).toBeInTheDocument();
  });

  it("viser riktig trygdedekning verdi", () => {
    const perioder = [
      {
        fom: "2022-01-01",
        tom: "2022-12-31",
        trygdedekning: "FTRL_2_9_FØRSTE_LEDD_C_ANDRE_LEDD_HELSE_PENSJON_SYKE_FORELDREPENGER",
      },
    ];
    render(<MedlemskapsPerioderTabell perioder={perioder} />);
    expect(screen.getByText("Helse- og pensjonsdel med syke- og foreldrepenger (§ 2-9)")).toBeInTheDocument();
  });
});
