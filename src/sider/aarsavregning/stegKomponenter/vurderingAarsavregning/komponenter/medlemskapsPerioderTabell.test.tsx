import { Avgiftspliktigperiode } from "../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import MedlemskapsPerioderTabell from "./medlemskapsPerioderTabell";
import { render, screen } from "@testing-library/react";

describe("MedlemskapsPerioderTabell", () => {
  it("ikke rendrer tabell når perioder prop er undefined", () => {
    render(<MedlemskapsPerioderTabell />);
    expect(screen.queryByText(/Medlemskap/i)).toBeNull();
    expect(screen.queryByText(/Dekning/i)).toBeNull();
  });

  it("rendrer tabell med data", () => {
    const perioder = [
      {
        fomDato: "2022-01-01",
        tomDato: "2022-12-31",
        trygdedekning: "Full",
        id: 0,
        bestemmelse: "bestemmelse",
        innvilgelsesResultat: "PLIKTIG",
        medlemskapstype: "type",
      },
    ] as Avgiftspliktigperiode[];
    render(<MedlemskapsPerioderTabell perioder={perioder} />);
    expect(screen.getByText(/Medlemskap/i)).toBeInTheDocument();
    expect(screen.getByText(/Dekning/i)).toBeInTheDocument();
  });

  it("rendrer tabell med flere perioder", () => {
    const perioder = [
      {
        fomDato: "2022-01-01",
        tomDato: "2022-12-31",
        trygdedekning: "Full",
        id: 0,
        bestemmelse: "bestemmelse",
        innvilgelsesResultat: "PLIKTIG",
        medlemskapstype: "type",
      },
      {
        fomDato: "2023-01-01",
        tomDato: "2023-12-31",
        trygdedekning: "Delvis",
        id: 0,
        bestemmelse: "bestemmelse",
        innvilgelsesResultat: "PLIKTIG",
        medlemskapstype: "type",
      },
    ] as Avgiftspliktigperiode[];
    render(<MedlemskapsPerioderTabell perioder={perioder} />);
    const rows = screen.getAllByRole("row");
    expect(rows.length - 1).toBe(perioder.length); // -1 for header
  });

  it("formaterer og viser riktig fom og tom datoer", () => {
    const perioder = [
      {
        fomDato: "2022-01-01",
        tomDato: "2022-12-31",
        trygdedekning: "Full",
        id: 0,
        bestemmelse: "bestemmelse",
        innvilgelsesResultat: "PLIKTIG",
        medlemskapstype: "type",
      },
    ] as Avgiftspliktigperiode[];
    render(<MedlemskapsPerioderTabell perioder={perioder} />);
    expect(screen.getByText("01.01.2022 - 31.12.2022")).toBeInTheDocument();
  });

  it("viser riktig trygdedekning verdi", () => {
    const perioder = [
      {
        fomDato: "2022-01-01",
        tomDato: "2022-12-31",
        trygdedekning: "FTRL_2_9_FØRSTE_LEDD_C_ANDRE_LEDD_HELSE_PENSJON_SYKE_FORELDREPENGER",
        id: 0,
        bestemmelse: "bestemmelse",
        innvilgelsesResultat: "PLIKTIG",
        medlemskapstype: "type",
      },
    ] as Avgiftspliktigperiode[];
    render(<MedlemskapsPerioderTabell perioder={perioder} />);
    expect(screen.getByText("Helse- og pensjonsdel med syke- og foreldrepenger (§ 2-9)")).toBeInTheDocument();
  });
});
