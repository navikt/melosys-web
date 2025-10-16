import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorMessage from "./errorMessage";

describe("ErrorMessage", () => {
  const defaultFeilobjekt = {
    varselTekst: "Noe gikk galt",
    status: 500,
    statusTekst: "Internal Server Error",
    fetchdata: {
      timestamp: "2024-10-16T12:00:00Z",
    },
  };

  it("skal rendre feilmelding med status", () => {
    render(<ErrorMessage feilobjekt={defaultFeilobjekt} />);

    expect(screen.getByText(/500 : Internal Server Error/)).toBeInTheDocument();
  });

  it("skal rendre varseltekst", () => {
    const { container } = render(<ErrorMessage feilobjekt={defaultFeilobjekt} />);

    expect(container.textContent).toContain("Noe gikk galt");
  });

  it("skal rendre timestamp", () => {
    const { container } = render(<ErrorMessage feilobjekt={defaultFeilobjekt} />);

    expect(container.textContent).toContain("2024-10-16T12:00:00Z");
  });

  it("skal ha error-message className", () => {
    const { container } = render(<ErrorMessage feilobjekt={defaultFeilobjekt} />);

    const errorDiv = container.querySelector(".error-message");
    expect(errorDiv).toBeInTheDocument();
  });

  it("skal vise warning alert variant", () => {
    const { container } = render(<ErrorMessage feilobjekt={defaultFeilobjekt} />);

    const alert = container.querySelector(".navds-alert--warning");
    expect(alert).toBeInTheDocument();
  });

  it("skal håndtere status som string", () => {
    const feilobjekt = {
      ...defaultFeilobjekt,
      status: "404",
    };

    render(<ErrorMessage feilobjekt={feilobjekt} />);

    expect(screen.getByText(/404 : Internal Server Error/)).toBeInTheDocument();
  });

  it("skal håndtere status som number", () => {
    const feilobjekt = {
      ...defaultFeilobjekt,
      status: 403,
    };

    render(<ErrorMessage feilobjekt={feilobjekt} />);

    expect(screen.getByText(/403 : Internal Server Error/)).toBeInTheDocument();
  });

  it("skal rendre ulike statustekster", () => {
    const feilobjekt = {
      ...defaultFeilobjekt,
      statusTekst: "Not Found",
      status: 404,
    };

    render(<ErrorMessage feilobjekt={feilobjekt} />);

    expect(screen.getByText(/404 : Not Found/)).toBeInTheDocument();
  });

  it("skal rendre ulike varseltekster", () => {
    const feilobjekt = {
      ...defaultFeilobjekt,
      varselTekst: "Kunne ikke laste data",
    };

    const { container } = render(<ErrorMessage feilobjekt={feilobjekt} />);

    expect(container.textContent).toContain("Kunne ikke laste data");
  });

  it("skal rendre ulike timestamps", () => {
    const feilobjekt = {
      ...defaultFeilobjekt,
      fetchdata: {
        timestamp: "2023-01-01T00:00:00Z",
      },
    };

    const { container } = render(<ErrorMessage feilobjekt={feilobjekt} />);

    expect(container.textContent).toContain("2023-01-01T00:00:00Z");
  });

  it("skal rendre alle tre deler av feilmeldingen", () => {
    const { container } = render(<ErrorMessage feilobjekt={defaultFeilobjekt} />);

    // Status og statusTekst
    expect(screen.getByText(/500 : Internal Server Error/)).toBeInTheDocument();
    // Timestamp
    expect(container.textContent).toContain("2024-10-16T12:00:00Z");
    // Varseltekst
    expect(container.textContent).toContain("Noe gikk galt");
  });

  it("skal håndtere tom varseltekst", () => {
    const feilobjekt = {
      ...defaultFeilobjekt,
      varselTekst: "",
    };

    const { container } = render(<ErrorMessage feilobjekt={feilobjekt} />);

    expect(container.querySelector(".error-message")).toBeInTheDocument();
  });

  it("skal håndtere lang feilmelding", () => {
    const feilobjekt = {
      ...defaultFeilobjekt,
      varselTekst: "Dette er en veldig lang feilmelding som beskriver i detalj hva som gikk galt",
      statusTekst: "Internal Server Error with additional details",
    };

    const { container } = render(<ErrorMessage feilobjekt={feilobjekt} />);

    expect(container.textContent).toContain(
      "Dette er en veldig lang feilmelding som beskriver i detalj hva som gikk galt",
    );
  });
});
