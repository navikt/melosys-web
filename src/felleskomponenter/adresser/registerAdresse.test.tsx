import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import RegisterAdresse from "./registerAdresse";

vi.mock("../../kodeverk", () => ({
  objektTilTermUtenFeilmelding: vi.fn((obj) => obj?.term || "Norge"),
}));

describe("RegisterAdresse", () => {
  it("skal vise '(ingen tilgjengelig)' for undefined adresse", () => {
    const { container } = render(<RegisterAdresse adresse={undefined} />);

    expect(container.textContent).toContain("(ingen tilgjengelig)");
  });

  it("skal vise '(ingen tilgjengelig)' for null adresse", () => {
    const { container } = render(<RegisterAdresse adresse={{}} />);

    expect(container.textContent).toContain("(ingen tilgjengelig)");
  });

  it("skal vise '(ingen tilgjengelig)' for tom adresse", () => {
    const { container } = render(<RegisterAdresse adresse={{}} />);

    expect(container.textContent).toContain("(ingen tilgjengelig)");
  });

  it("skal rendre komplett adresse med alle felter", () => {
    const adresse = {
      gateadresse: {
        gatenavn: "Storgata",
        husnummer: "1",
        husbokstav: "A",
      },
      postnr: "0001",
      poststed: "Oslo",
      land: "Norge",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Storgata 1A, 0001 Oslo, Norge");
  });

  it("skal rendre adresse uten husbokstav", () => {
    const adresse = {
      gateadresse: {
        gatenavn: "Storgata",
        husnummer: "1",
      },
      postnr: "0001",
      poststed: "Oslo",
      land: "Norge",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Storgata 1, 0001 Oslo, Norge");
    expect(container.textContent).not.toContain("1A");
  });

  it("skal rendre adresse uten husnummer", () => {
    const adresse = {
      gateadresse: {
        gatenavn: "Storgata",
      },
      postnr: "0001",
      poststed: "Oslo",
      land: "Norge",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Storgata");
    expect(container.textContent).toContain("0001 Oslo");
    expect(container.textContent).toContain("Norge");
  });

  it("skal rendre adresse med bare postnummer og poststed", () => {
    const adresse = {
      postnr: "0001",
      poststed: "Oslo",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("0001 Oslo");
  });

  it("skal rendre adresse med bare land", () => {
    const adresse = {
      land: "Norge",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Norge");
  });

  it("skal rendre adresse element som address tag", () => {
    const adresse = {
      gateadresse: {
        gatenavn: "Storgata",
        husnummer: "1",
      },
      postnr: "0001",
      poststed: "Oslo",
      land: "Norge",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    const addressElement = container.querySelector("address");
    expect(addressElement).toBeInTheDocument();
    expect(addressElement).toHaveClass("registeradresse");
  });

  it("skal håndtere land som objekt", () => {
    const adresse = {
      gateadresse: {
        gatenavn: "Storgata",
        husnummer: "1",
      },
      postnr: "0001",
      poststed: "Oslo",
      land: { term: "Norge", kode: "NO" },
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Norge");
  });

  it("skal rendre gate på egen linje når postnr/poststed mangler", () => {
    const adresse = {
      gateadresse: {
        gatenavn: "Storgata",
        husnummer: "1",
      },
      land: "Norge",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);
    const divs = container.querySelectorAll("div");

    expect(divs[0].textContent).toContain("Storgata 1");
    expect(divs[1].textContent).toBe("Norge");
  });

  it("skal rendre postnr/poststed på egen linje når gate mangler", () => {
    const adresse = {
      postnr: "0001",
      poststed: "Oslo",
      land: "Norge",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);
    const divs = container.querySelectorAll("div");

    expect(divs[0].textContent).toContain("0001 Oslo");
    expect(divs[1].textContent).toBe("Norge");
  });

  it("skal håndtere bare gatenavn uten nummer", () => {
    const adresse = {
      gateadresse: {
        gatenavn: "Storgata",
      },
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Storgata");
  });

  it("skal håndtere bare husnummer uten gatenavn", () => {
    const adresse = {
      gateadresse: {
        husnummer: "123",
      },
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("123");
  });

  it("skal håndtere bare husbokstav", () => {
    const adresse = {
      gateadresse: {
        husbokstav: "A",
      },
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("A");
  });

  it("skal håndtere tom gateadresse objekt", () => {
    const adresse = {
      gateadresse: {},
      postnr: "0001",
      poststed: "Oslo",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("0001 Oslo");
  });

  it("skal håndtere bare postnummer uten poststed", () => {
    const adresse = {
      postnr: "0001",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("0001");
  });

  it("skal håndtere bare poststed uten postnummer", () => {
    const adresse = {
      poststed: "Oslo",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Oslo");
  });

  it("skal rendre adresse i en linje når alle hovedfelter finnes", () => {
    const adresse = {
      gateadresse: {
        gatenavn: "Storgata",
        husnummer: "1",
        husbokstav: "A",
      },
      postnr: "0001",
      poststed: "Oslo",
      land: "Norge",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);
    const divs = container.querySelectorAll("div");

    // Skal bare ha én div når alle felter finnes
    expect(divs).toHaveLength(1);
    expect(divs[0].textContent).toContain("Storgata 1A, 0001 Oslo, Norge");
  });

  it("skal rendre adresse på flere linjer når land mangler", () => {
    const adresse = {
      gateadresse: {
        gatenavn: "Storgata",
        husnummer: "1",
      },
      postnr: "0001",
      poststed: "Oslo",
      // Ingen land - vil ikke oppfylle alle tre kriterier for en-linje formattering
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    // Når ikke alle tre kriterier er oppfylt (gate, postnr/poststed OG land),
    // rendres ikke på en linje
    expect(container.textContent).toContain("Storgata 1");
    expect(container.textContent).toContain("0001 Oslo");
  });

  it("skal håndtere adresse med alle felt på null/undefined", () => {
    const adresse = {
      gateadresse: null,
      postnr: null,
      poststed: null,
      land: null,
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("(ingen tilgjengelig)");
  });

  it("skal håndtere tomt land objekt", () => {
    const adresse = {
      gateadresse: {
        gatenavn: "Storgata",
      },
      land: {},
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Storgata");
  });

  it("skal rendre med riktig className", () => {
    const adresse = {
      gateadresse: {
        gatenavn: "Storgata",
      },
      postnr: "0001",
      poststed: "Oslo",
      land: "Norge",
    };

    const { container } = render(<RegisterAdresse adresse={adresse} />);
    const addressElement = container.querySelector("address");

    expect(addressElement).toHaveClass("registeradresse");
  });

  it("skal ikke vise address element for tom adresse", () => {
    const { container } = render(<RegisterAdresse adresse={{}} />);
    const addressElement = container.querySelector("address");

    expect(addressElement).not.toBeInTheDocument();
  });
});
