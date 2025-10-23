import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StrukturertAdresse from "./strukturertAdresse";

describe("StrukturertAdresse", () => {
  it("skal rendre address element", () => {
    const { container } = render(<StrukturertAdresse adresse={{}} />);

    expect(container.querySelector("address")).toBeInTheDocument();
  });

  it("skal rendre coAdressenavn", () => {
    render(<StrukturertAdresse adresse={{ coAdressenavn: "c/o Hansen" }} />);

    expect(screen.getByText("c/o Hansen")).toBeInTheDocument();
  });

  it("skal rendre tilleggsnavn", () => {
    render(<StrukturertAdresse adresse={{ tilleggsnavn: "Blokk A" }} />);

    expect(screen.getByText("Blokk A")).toBeInTheDocument();
  });

  it("skal rendre gatenavn og husnummer", () => {
    const { container } = render(
      <StrukturertAdresse adresse={{ gatenavn: "Storgata", husnummerEtasjeLeilighet: "12B" }} />,
    );

    expect(container.textContent).toContain("Storgata");
    expect(container.textContent).toContain("12B");
  });

  it("skal rendre postboks, postnummer og poststed", () => {
    const { container } = render(
      <StrukturertAdresse adresse={{ postboks: "Postboks 123", postnummer: "0001", poststed: "Oslo" }} />,
    );

    expect(container.textContent).toContain("Postboks 123");
    expect(container.textContent).toContain("0001");
    expect(container.textContent).toContain("Oslo");
  });

  it("skal rendre region og landkode", () => {
    const { container } = render(<StrukturertAdresse adresse={{ region: "Akershus", landkode: "NO" }} />);

    expect(container.textContent).toContain("Akershus");
    expect(container.textContent).toContain("NO");
  });

  it("skal rendre komplett adresse", () => {
    const adresse = {
      coAdressenavn: "c/o Hansen",
      tilleggsnavn: "Blokk A",
      gatenavn: "Storgata",
      husnummerEtasjeLeilighet: "12B",
      postboks: "Postboks 123",
      postnummer: "0001",
      poststed: "Oslo",
      region: "Akershus",
      landkode: "NO",
    };

    const { container } = render(<StrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("c/o Hansen");
    expect(container.textContent).toContain("Blokk A");
    expect(container.textContent).toContain("Storgata");
    expect(container.textContent).toContain("12B");
    expect(container.textContent).toContain("Postboks 123");
    expect(container.textContent).toContain("0001");
    expect(container.textContent).toContain("Oslo");
    expect(container.textContent).toContain("Akershus");
    expect(container.textContent).toContain("NO");
  });

  it("skal håndtere tom adresse", () => {
    const { container } = render(<StrukturertAdresse adresse={{}} />);

    expect(container.querySelector("address")).toBeInTheDocument();
  });

  it("skal ha fem div elementer i address", () => {
    const { container } = render(<StrukturertAdresse adresse={{}} />);

    const address = container.querySelector("address");
    const divs = address?.querySelectorAll("div");
    expect(divs).toHaveLength(5);
  });

  it("skal rendre kun gatenavn uten husnummer", () => {
    const { container } = render(<StrukturertAdresse adresse={{ gatenavn: "Storgata" }} />);

    expect(container.textContent).toContain("Storgata");
  });

  it("skal rendre kun husnummer uten gatenavn", () => {
    const { container } = render(<StrukturertAdresse adresse={{ husnummerEtasjeLeilighet: "12B" }} />);

    expect(container.textContent).toContain("12B");
  });

  it("skal rendre kun postnummer uten poststed", () => {
    const { container } = render(<StrukturertAdresse adresse={{ postnummer: "0001" }} />);

    expect(container.textContent).toContain("0001");
  });

  it("skal rendre kun poststed uten postnummer", () => {
    const { container } = render(<StrukturertAdresse adresse={{ poststed: "Oslo" }} />);

    expect(container.textContent).toContain("Oslo");
  });

  it("skal rendre kun region uten landkode", () => {
    const { container } = render(<StrukturertAdresse adresse={{ region: "Akershus" }} />);

    expect(container.textContent).toContain("Akershus");
  });

  it("skal rendre kun landkode uten region", () => {
    const { container } = render(<StrukturertAdresse adresse={{ landkode: "NO" }} />);

    expect(container.textContent).toContain("NO");
  });

  it("skal rendre partiell adresse med kun noen felter", () => {
    const adresse = {
      gatenavn: "Storgata",
      husnummerEtasjeLeilighet: "12B",
      postnummer: "0001",
      poststed: "Oslo",
    };

    const { container } = render(<StrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Storgata");
    expect(container.textContent).toContain("12B");
    expect(container.textContent).toContain("0001");
    expect(container.textContent).toContain("Oslo");
  });

  it("skal håndtere utenlandsk adresse", () => {
    const adresse = {
      gatenavn: "Main Street",
      husnummerEtasjeLeilighet: "42",
      postnummer: "12345",
      poststed: "New York",
      region: "NY",
      landkode: "US",
    };

    const { container } = render(<StrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Main Street");
    expect(container.textContent).toContain("42");
    expect(container.textContent).toContain("12345");
    expect(container.textContent).toContain("New York");
    expect(container.textContent).toContain("NY");
    expect(container.textContent).toContain("US");
  });

  it("skal håndtere postboksadresse", () => {
    const adresse = {
      postboks: "Postboks 456",
      postnummer: "5020",
      poststed: "Bergen",
      landkode: "NO",
    };

    const { container } = render(<StrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Postboks 456");
    expect(container.textContent).toContain("5020");
    expect(container.textContent).toContain("Bergen");
    expect(container.textContent).toContain("NO");
  });

  it("skal håndtere c/o adresse", () => {
    const adresse = {
      coAdressenavn: "c/o Per Hansen",
      gatenavn: "Lillegata",
      husnummerEtasjeLeilighet: "5",
      postnummer: "7000",
      poststed: "Trondheim",
    };

    const { container } = render(<StrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("c/o Per Hansen");
    expect(container.textContent).toContain("Lillegata");
    expect(container.textContent).toContain("5");
    expect(container.textContent).toContain("7000");
    expect(container.textContent).toContain("Trondheim");
  });
});
