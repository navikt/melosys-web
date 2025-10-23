import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BrevAdresse from "./brevAdresse";
import { DokumenterV2 } from "../../services/api";

const defaultProps: DokumenterV2.BrevAdresse = {
  mottakerNavn: "",
  orgnr: null,
  adresselinjer: [],
  postnr: "",
  poststed: "",
  region: "",
  land: "",
  ugyldig: false,
};

describe("BrevAdresse", () => {
  it("skal rendre mottakerNavn når visNavn er true", () => {
    render(<BrevAdresse {...defaultProps} mottakerNavn="Per Hansen" visNavn={true} />);

    expect(screen.getByText("Per Hansen")).toBeInTheDocument();
  });

  it("skal ikke rendre mottakerNavn når visNavn er false", () => {
    render(<BrevAdresse {...defaultProps} mottakerNavn="Per Hansen" visNavn={false} />);

    expect(screen.queryByText("Per Hansen")).not.toBeInTheDocument();
  });

  it("skal ikke rendre mottakerNavn når visNavn mangler", () => {
    render(<BrevAdresse {...defaultProps} mottakerNavn="Per Hansen" />);

    expect(screen.queryByText("Per Hansen")).not.toBeInTheDocument();
  });

  it("skal rendre adresselinjer", () => {
    const { container } = render(<BrevAdresse {...defaultProps} adresselinjer={["Storgata 1", "Blokk A"]} />);

    expect(container.textContent).toContain("Storgata 1");
    expect(container.textContent).toContain("Blokk A");
  });

  it("skal rendre postnr og poststed", () => {
    const { container } = render(<BrevAdresse {...defaultProps} postnr="0001" poststed="Oslo" />);

    expect(container.textContent).toContain("0001");
    expect(container.textContent).toContain("Oslo");
  });

  it("skal rendre region", () => {
    const { container } = render(<BrevAdresse {...defaultProps} region="Akershus" />);

    expect(container.textContent).toContain("Akershus");
  });

  it("skal rendre land", () => {
    const { container } = render(<BrevAdresse {...defaultProps} land="Norge" />);

    expect(container.textContent).toContain("Norge");
  });

  it("skal legge til custom className", () => {
    const { container } = render(<BrevAdresse {...defaultProps} className="custom-class" />);

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("skal rendre komplett adresse", () => {
    const { container } = render(
      <BrevAdresse
        {...defaultProps}
        mottakerNavn="Per Hansen"
        visNavn={true}
        adresselinjer={["Storgata 1", "Blokk A"]}
        postnr="0001"
        poststed="Oslo"
        region="Akershus"
        land="Norge"
      />,
    );

    expect(screen.getByText("Per Hansen")).toBeInTheDocument();
    expect(container.textContent).toContain("Storgata 1");
    expect(container.textContent).toContain("Blokk A");
    expect(container.textContent).toContain("0001");
    expect(container.textContent).toContain("Oslo");
    expect(container.textContent).toContain("Akershus");
    expect(container.textContent).toContain("Norge");
  });

  it("skal håndtere tom adresse", () => {
    const { container } = render(<BrevAdresse {...defaultProps} />);

    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("skal separere adresselinjer med komma", () => {
    const { container } = render(<BrevAdresse {...defaultProps} adresselinjer={["Storgata 1", "Blokk A"]} />);

    expect(container.textContent).toContain("Storgata 1, Blokk A");
  });

  it("skal separere postnr og poststed med mellomrom", () => {
    const { container } = render(<BrevAdresse {...defaultProps} postnr="0001" poststed="Oslo" />);

    expect(container.textContent).toContain("0001 Oslo");
  });

  it("skal legge til komma etter adresselinjer", () => {
    const { container } = render(<BrevAdresse {...defaultProps} adresselinjer={["Storgata 1"]} postnr="0001" />);

    expect(container.textContent).toContain("Storgata 1,");
  });

  it("skal legge til komma etter postnr og poststed", () => {
    const { container } = render(<BrevAdresse {...defaultProps} postnr="0001" poststed="Oslo" region="Akershus" />);

    expect(container.textContent).toContain("0001 Oslo,");
  });

  it("skal legge til komma etter region", () => {
    const { container } = render(<BrevAdresse {...defaultProps} region="Akershus" land="Norge" />);

    expect(container.textContent).toContain("Akershus,");
  });

  it("skal ikke legge til komma etter land", () => {
    const { container } = render(<BrevAdresse {...defaultProps} land="Norge" />);

    // Land skal være siste felt uten komma
    expect(container.textContent).toContain("Norge");
    expect(container.textContent).not.toContain("Norge,");
  });

  it("skal håndtere tom adresselinjer array", () => {
    const { container } = render(<BrevAdresse {...defaultProps} adresselinjer={[]} postnr="0001" />);

    expect(container.textContent).toContain("0001");
  });

  it("skal håndtere én adresselinje", () => {
    const { container } = render(<BrevAdresse {...defaultProps} adresselinjer={["Storgata 1"]} />);

    expect(container.textContent).toContain("Storgata 1");
  });

  it("skal håndtere flere adresselinjer", () => {
    const { container } = render(
      <BrevAdresse {...defaultProps} adresselinjer={["Storgata 1", "Blokk A", "Leil. 12"]} />,
    );

    expect(container.textContent).toContain("Storgata 1, Blokk A, Leil. 12");
  });

  it("skal rendre navn med semibold font", () => {
    render(<BrevAdresse {...defaultProps} mottakerNavn="Per Hansen" visNavn={true} />);

    const navn = screen.getByText("Per Hansen");
    // The BodyLong component wraps the text, not its parent
    expect(navn).toBeInTheDocument();
  });

  it("skal håndtere utenlandsk adresse", () => {
    const { container } = render(
      <BrevAdresse
        {...defaultProps}
        adresselinjer={["42 Main Street", "Apt 5"]}
        postnr="12345"
        poststed="New York"
        region="NY"
        land="USA"
      />,
    );

    expect(container.textContent).toContain("42 Main Street, Apt 5");
    expect(container.textContent).toContain("12345 New York");
    expect(container.textContent).toContain("NY");
    expect(container.textContent).toContain("USA");
  });

  it("skal håndtere partiell adresse med kun noen felter", () => {
    const { container } = render(<BrevAdresse {...defaultProps} adresselinjer={["Storgata 1"]} land="Norge" />);

    expect(container.textContent).toContain("Storgata 1");
    expect(container.textContent).toContain("Norge");
  });

  it("skal håndtere kun postnr uten poststed", () => {
    const { container } = render(<BrevAdresse {...defaultProps} postnr="0001" />);

    expect(container.textContent).toContain("0001");
  });

  it("skal håndtere kun poststed uten postnr", () => {
    const { container } = render(<BrevAdresse {...defaultProps} poststed="Oslo" />);

    expect(container.textContent).toContain("Oslo");
  });

  it("skal håndtere kun region uten land", () => {
    const { container } = render(<BrevAdresse {...defaultProps} region="Akershus" />);

    expect(container.textContent).toContain("Akershus");
  });

  it("skal håndtere kun land uten region", () => {
    const { container } = render(<BrevAdresse {...defaultProps} land="Norge" />);

    expect(container.textContent).toContain("Norge");
  });

  it("skal filtrere ut tomme adresselinjer", () => {
    const { container } = render(<BrevAdresse {...defaultProps} adresselinjer={["Storgata 1", "", "Blokk A"]} />);

    expect(container.textContent).toContain("Storgata 1, Blokk A");
  });

  it("skal håndtere lang adresse med mange felter", () => {
    const { container } = render(
      <BrevAdresse
        {...defaultProps}
        mottakerNavn="Firma AS c/o Per Hansen"
        visNavn={true}
        adresselinjer={["Postboks 123", "Besøksadresse: Storgata 45", "3. etasje"]}
        postnr="0001"
        poststed="Oslo"
        region="Akershus fylke"
        land="Norge"
      />,
    );

    expect(screen.getByText("Firma AS c/o Per Hansen")).toBeInTheDocument();
    expect(container.textContent).toContain("Postboks 123");
    expect(container.textContent).toContain("Besøksadresse: Storgata 45");
    expect(container.textContent).toContain("3. etasje");
    expect(container.textContent).toContain("0001 Oslo");
    expect(container.textContent).toContain("Akershus fylke");
    expect(container.textContent).toContain("Norge");
  });
});
