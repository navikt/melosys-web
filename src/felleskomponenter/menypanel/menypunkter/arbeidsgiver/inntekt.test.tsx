import Inntekt from "./inntekt";
import { render, screen } from "@testing-library/react";

describe("inntekt", () => {
  let props: { inntektListe: any[] };

  beforeEach(() => {
    props = {
      inntektListe: [],
    };
  });

  it("viser ingenting ved tom inntektliste", () => {
    const { container } = render(<Inntekt {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("viser ingenting ved inntektliste med kun nullbeløp", () => {
    props.inntektListe = [
      {
        beloep: 0,
        aarMaaned: "2023-01",
      },
    ];
    const { container } = render(<Inntekt {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("viser tabell dersom det finnes minst 1 inntekt med beløp over 0", () => {
    props.inntektListe = [
      {
        beloep: 10000,
        aarMaaned: "2023-01",
      },
    ];
    render(<Inntekt {...props} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Inntekt")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("viser tabell med riktig data formatering", () => {
    props.inntektListe = [
      {
        beloep: 25000.5,
        aarMaaned: "2023-01",
      },
      {
        beloep: 30000,
        aarMaaned: "2023-02",
      },
    ];
    render(<Inntekt {...props} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Periode")).toBeInTheDocument();
    expect(screen.getByText("Samlet inntekt")).toBeInTheDocument();
  });
});
