import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MedlemskapsperioderDisplay } from "./medlemskapsperiodeDisplay";
import { Avgiftspliktigperiode } from "../../../../../services/modules/types/periodeTyper";

describe("MedlemskapsperioderDisplay", () => {
  const mockPeriode: Avgiftspliktigperiode = {
    type: "MEDLEMSKAPSPERIODE",
    id: 1,
    fomDato: "01.01.2023",
    tomDato: "31.12.2023",
    bestemmelse: "FTRL_2_7",
    innvilgelsesResultat: "INNVILGET",
    trygdedekning: "FULL_DEKNING",
    medlemskapstype: "PLIKTIG",
    redigerbar: false,
  };

  it("skal vise alle medlemskapsperioder", () => {
    const perioder: Avgiftspliktigperiode[] = [
      { ...mockPeriode, id: 1, fomDato: "01.01.2023", tomDato: "30.06.2023" },
      { ...mockPeriode, id: 2, fomDato: "01.07.2023", tomDato: "31.12.2023" },
      { ...mockPeriode, id: 3, fomDato: "01.01.2024", tomDato: "30.06.2024" },
    ];

    render(<MedlemskapsperioderDisplay medlemskapsperioder={perioder} />);

    expect(screen.getByDisplayValue("01.01.2023")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30.06.2023")).toBeInTheDocument();
    expect(screen.getByDisplayValue("01.07.2023")).toBeInTheDocument();
    expect(screen.getByDisplayValue("31.12.2023")).toBeInTheDocument();
    expect(screen.getByDisplayValue("01.01.2024")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30.06.2024")).toBeInTheDocument();
  });

  it("skal vise bestemmelse fra første periode", () => {
    const perioder: Avgiftspliktigperiode[] = [
      { ...mockPeriode, id: 1, bestemmelse: "FTRL_2_7" },
      { ...mockPeriode, id: 2, bestemmelse: "FTRL_2_8" },
    ];

    const { container } = render(<MedlemskapsperioderDisplay medlemskapsperioder={perioder} />);

    // Bestemmelsen vises i select - vi sjekker at den finnes i DOM
    expect(container.textContent).toContain("Bestemmelse");
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThan(0);
  });

  it("skal vise label 'Medlemskapsperiode' kun på første rad", () => {
    const perioder: Avgiftspliktigperiode[] = [
      { ...mockPeriode, id: 1, fomDato: "01.01.2023", tomDato: "30.06.2023" },
      { ...mockPeriode, id: 2, fomDato: "01.07.2023", tomDato: "31.12.2023" },
    ];

    render(<MedlemskapsperioderDisplay medlemskapsperioder={perioder} />);

    // Sjekk at vi kun har én label med teksten "Medlemskapsperiode"
    const labels = screen.getAllByText("Medlemskapsperiode");
    expect(labels).toHaveLength(1);
  });

  it("skal vise label 'Dekning' kun på første rad", () => {
    const perioder: Avgiftspliktigperiode[] = [
      { ...mockPeriode, id: 1, trygdedekning: "FULL_DEKNING" },
      { ...mockPeriode, id: 2, trygdedekning: "DELVIS_DEKNING" },
      { ...mockPeriode, id: 3, trygdedekning: "FULL_DEKNING" },
    ];

    render(<MedlemskapsperioderDisplay medlemskapsperioder={perioder} />);

    // Sjekk at vi kun har én label med teksten "Dekning"
    const labels = screen.getAllByText("Dekning");
    expect(labels).toHaveLength(1);
  });

  it("skal returnere null for tom liste", () => {
    const { container } = render(<MedlemskapsperioderDisplay medlemskapsperioder={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("skal returnere null for undefined liste", () => {
    const { container } = render(<MedlemskapsperioderDisplay medlemskapsperioder={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("skal returnere null for null liste", () => {
    const { container } = render(<MedlemskapsperioderDisplay medlemskapsperioder={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("skal vise én enkelt periode korrekt", () => {
    const perioder: Avgiftspliktigperiode[] = [mockPeriode];

    const { container } = render(<MedlemskapsperioderDisplay medlemskapsperioder={perioder} />);

    expect(screen.getByDisplayValue("01.01.2023")).toBeInTheDocument();
    expect(screen.getByDisplayValue("31.12.2023")).toBeInTheDocument();

    // Verifiser at bestemmelse og dekning finnes
    expect(container.textContent).toContain("Bestemmelse");
    expect(container.textContent).toContain("Dekning");
  });

  it("skal vise forskjellige trygdedekninger for hver periode", () => {
    const perioder: Avgiftspliktigperiode[] = [
      { ...mockPeriode, id: 1, trygdedekning: "FULL_DEKNING" },
      { ...mockPeriode, id: 2, trygdedekning: "DELVIS_DEKNING" },
    ];

    render(<MedlemskapsperioderDisplay medlemskapsperioder={perioder} />);

    // Begge dekningstypene skal være synlige i DOM
    const selects = screen.getAllByRole("combobox");
    // Vi forventer minst 2 selects (én for bestemmelse, to for dekning)
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });

  it("skal ha readonly inputs for datoer", () => {
    const perioder: Avgiftspliktigperiode[] = [mockPeriode];

    render(<MedlemskapsperioderDisplay medlemskapsperioder={perioder} />);

    // Datovelgerne skal være readonly (disabled i dette tilfellet)
    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toHaveAttribute("readonly");
    });
  });

  it("skal vise selects for bestemmelse og dekning", () => {
    const perioder: Avgiftspliktigperiode[] = [mockPeriode];

    render(<MedlemskapsperioderDisplay medlemskapsperioder={perioder} />);

    const selects = screen.getAllByRole("combobox");
    // Skal ha minst 2 selects (bestemmelse og dekning)
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });
});
