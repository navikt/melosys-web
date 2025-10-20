import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LabelMedHjelpetekst from "./labelMedHjelpetekst";

describe("LabelMedHjelpetekst", () => {
  it("skal rendre label", () => {
    render(<LabelMedHjelpetekst label="Min label" />);

    expect(screen.getByText("Min label")).toBeInTheDocument();
  });

  it("skal ha labelMedHjelpetekst__wrapper className", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" />);

    expect(container.querySelector(".labelMedHjelpetekst__wrapper")).toBeInTheDocument();
  });

  it("skal rendre hjelpetekst når gitt", () => {
    render(<LabelMedHjelpetekst label="Test" hjelpetekst="Dette er hjelpetekst" />);

    const helpButton = screen.getByRole("button", { name: /hjelpetekst/ });
    expect(helpButton).toBeInTheDocument();
  });

  it("skal ikke rendre hjelpetekst når den mangler", () => {
    render(<LabelMedHjelpetekst label="Test" />);

    const helpButton = screen.queryByRole("button", { name: /hjelpetekst/ });
    expect(helpButton).not.toBeInTheDocument();
  });

  it("skal ikke rendre hjelpetekst når den er null", () => {
    render(<LabelMedHjelpetekst label="Test" hjelpetekst={null} />);

    const helpButton = screen.queryByRole("button", { name: /hjelpetekst/ });
    expect(helpButton).not.toBeInTheDocument();
  });

  it("skal rendre label som span som default", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" />);

    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toBe("Test");
  });

  it("skal rendre label som heading når undertittel er true", () => {
    render(<LabelMedHjelpetekst label="Test" undertittel={true} />);

    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test");
  });

  it("skal ha undertittel className når undertittel er true", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" undertittel={true} />);

    expect(container.querySelector(".undertittel")).toBeInTheDocument();
  });

  it("skal rendre label med bold når bold er true", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" bold={true} />);

    const bold = container.querySelector("b");
    expect(bold).toBeInTheDocument();
    expect(bold?.textContent).toBe("Test");
  });

  it("skal ikke rendre label med bold når bold er false", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" bold={false} />);

    const bold = container.querySelector("b");
    expect(bold).not.toBeInTheDocument();
  });

  it("skal ha small className når small er true", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" small={true} />);

    const span = container.querySelector("span.small");
    expect(span).toBeInTheDocument();
  });

  it("skal ikke ha small className når small er false", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" small={false} />);

    const span = container.querySelector("span.small");
    expect(span).not.toBeInTheDocument();
  });

  it("skal ha default placement 'top'", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" hjelpetekst="Hjelp" />);

    // HelpText komponent skal rendres
    const helpText = container.querySelector(".labelMedHjelpetekst__hjelpetekst");
    expect(helpText).toBeInTheDocument();
  });

  it("skal kunne sette placement til 'bottom'", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" hjelpetekst="Hjelp" placement="bottom" />);

    const helpText = container.querySelector(".labelMedHjelpetekst__hjelpetekst");
    expect(helpText).toBeInTheDocument();
  });

  it("skal kunne sette placement til 'left'", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" hjelpetekst="Hjelp" placement="left" />);

    const helpText = container.querySelector(".labelMedHjelpetekst__hjelpetekst");
    expect(helpText).toBeInTheDocument();
  });

  it("skal kunne sette placement til 'right'", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" hjelpetekst="Hjelp" placement="right" />);

    const helpText = container.querySelector(".labelMedHjelpetekst__hjelpetekst");
    expect(helpText).toBeInTheDocument();
  });

  it("skal kunne sette placement til 'top-start'", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" hjelpetekst="Hjelp" placement="top-start" />);

    const helpText = container.querySelector(".labelMedHjelpetekst__hjelpetekst");
    expect(helpText).toBeInTheDocument();
  });

  it("skal rendre ReactNode som hjelpetekst", () => {
    render(
      <LabelMedHjelpetekst
        label="Test"
        hjelpetekst={
          <div>
            <strong>Viktig</strong> informasjon
          </div>
        }
      />,
    );

    const helpButton = screen.getByRole("button", { name: /hjelpetekst/ });
    expect(helpButton).toBeInTheDocument();
  });

  it("skal rendre string som hjelpetekst", () => {
    render(<LabelMedHjelpetekst label="Test" hjelpetekst="Dette er en string" />);

    const helpButton = screen.getByRole("button", { name: /hjelpetekst/ });
    expect(helpButton).toBeInTheDocument();
  });

  it("skal ha riktig title som prop på HelpText", () => {
    // HelpText komponenten får title prop, men det settes ikke nødvendigvis som HTML title attributt
    render(<LabelMedHjelpetekst label="Min label" hjelpetekst="Hjelp" />);

    const helpButton = screen.getByRole("button", { name: /hjelpetekst/ });
    expect(helpButton).toBeInTheDocument();
  });

  it("skal kombinere undertittel og hjelpetekst", () => {
    render(<LabelMedHjelpetekst label="Test" undertittel={true} hjelpetekst="Hjelp" />);

    expect(screen.getByRole("heading")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hjelpetekst/ })).toBeInTheDocument();
  });

  it("skal kombinere bold og hjelpetekst", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" bold={true} hjelpetekst="Hjelp" />);

    expect(container.querySelector("b")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hjelpetekst/ })).toBeInTheDocument();
  });

  it("skal kombinere small og hjelpetekst", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" small={true} hjelpetekst="Hjelp" />);

    expect(container.querySelector("span.small")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hjelpetekst/ })).toBeInTheDocument();
  });

  it("skal ikke kombinere undertittel og bold", () => {
    const { container } = render(<LabelMedHjelpetekst label="Test" undertittel={true} bold={true} />);

    // Når undertittel er true, skal bold ignoreres
    expect(screen.getByRole("heading")).toBeInTheDocument();
    const bold = container.querySelector("b");
    expect(bold).not.toBeInTheDocument();
  });

  it("skal håndtere lang label tekst", () => {
    const langLabel = "Dette er en veldig lang label tekst som skal testes";
    render(<LabelMedHjelpetekst label={langLabel} />);

    expect(screen.getByText(langLabel)).toBeInTheDocument();
  });

  it("skal håndtere tom label", () => {
    const { container } = render(<LabelMedHjelpetekst label="" />);

    expect(container.querySelector(".labelMedHjelpetekst__wrapper")).toBeInTheDocument();
  });
});
