import { Avgiftspliktigperiode } from "../../../../../services/modules/types/periodeTyper";
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
        type: "MEDLEMSKAPSPERIODE",
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

  it("sorterer perioder i stigende rekkefølge etter fomDato", () => {
    const perioder = [
      {
        fomDato: "2023-01-01",
        tomDato: "2023-12-31",
        trygdedekning: "Full",
        id: 1,
        bestemmelse: "bestemmelse",
        innvilgelsesResultat: "PLIKTIG",
        medlemskapstype: "type",
      },
      {
        fomDato: "2021-01-01",
        tomDato: "2021-12-31",
        trygdedekning: "Full",
        id: 2,
        bestemmelse: "bestemmelse",
        innvilgelsesResultat: "PLIKTIG",
        medlemskapstype: "type",
      },
      {
        fomDato: "2022-01-01",
        tomDato: "2022-12-31",
        trygdedekning: "Full",
        id: 3,
        bestemmelse: "bestemmelse",
        innvilgelsesResultat: "PLIKTIG",
        medlemskapstype: "type",
      },
    ] as Avgiftspliktigperiode[];
    render(<MedlemskapsPerioderTabell perioder={perioder} />);
    const rows = screen.getAllByRole("row");
    // Første rad er header, så vi starter fra index 1
    expect(rows[1]).toHaveTextContent("01.01.2021");
    expect(rows[2]).toHaveTextContent("01.01.2022");
    expect(rows[3]).toHaveTextContent("01.01.2023");
  });

  it("sorterer på tomDato når fomDato er lik", () => {
    const perioder = [
      {
        fomDato: "2022-01-01",
        tomDato: "2022-12-31",
        trygdedekning: "Full",
        id: 1,
        bestemmelse: "bestemmelse",
        innvilgelsesResultat: "PLIKTIG",
        medlemskapstype: "type",
      },
      {
        fomDato: "2022-01-01",
        tomDato: "2022-06-30",
        trygdedekning: "Full",
        id: 2,
        bestemmelse: "bestemmelse",
        innvilgelsesResultat: "PLIKTIG",
        medlemskapstype: "type",
      },
    ] as Avgiftspliktigperiode[];
    render(<MedlemskapsPerioderTabell perioder={perioder} />);
    const rows = screen.getAllByRole("row");
    // Første rad er header, så vi starter fra index 1
    // Perioden med tidligst tomDato skal komme først
    expect(rows[1]).toHaveTextContent("30.06.2022");
    expect(rows[2]).toHaveTextContent("31.12.2022");
  });
});
