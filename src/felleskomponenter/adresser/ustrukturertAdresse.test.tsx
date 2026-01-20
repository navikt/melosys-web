import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import UstrukturertAdresse from "./ustrukturertAdresse";

let uuidCounter = 0;
vi.mock("../../utils", () => ({
  _uuid: vi.fn(() => `test-uuid-${uuidCounter++}`),
}));

describe("UstrukturertAdresse", () => {
  it("skal rendre alle adresselinjer", () => {
    const adresse = {
      adresselinjer: ["Storgata 1", "2. etasje", "Leilighet 23"],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Storgata 1");
    expect(container.textContent).toContain("2. etasje");
    expect(container.textContent).toContain("Leilighet 23");
  });

  it("skal rendre landkode", () => {
    const adresse = {
      adresselinjer: ["Storgata 1"],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("NO");
  });

  it("skal bruke address element", () => {
    const adresse = {
      adresselinjer: ["Storgata 1"],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);

    const addressElement = container.querySelector("address");
    expect(addressElement).toBeInTheDocument();
  });

  it("skal håndtere tom adresselinje array", () => {
    const adresse = {
      adresselinjer: [],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);

    const addressElement = container.querySelector("address");
    expect(addressElement).toBeInTheDocument();
    expect(addressElement?.textContent).toBe("NO");
  });

  it("skal håndtere en enkelt adresselinje", () => {
    const adresse = {
      adresselinjer: ["Storgata 1"],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);
    const divs = container.querySelectorAll("div");

    expect(divs).toHaveLength(1);
    expect(divs[0].textContent).toBe("Storgata 1");
  });

  it("skal håndtere flere adresselinjer", () => {
    const adresse = {
      adresselinjer: ["Line 1", "Line 2", "Line 3", "Line 4"],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);
    const divs = container.querySelectorAll("div");

    expect(divs).toHaveLength(4);
  });

  it("skal hoppe over null adresselinjer", () => {
    const adresse = {
      adresselinjer: ["Storgata 1", null, "3. etasje"],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);
    const divs = container.querySelectorAll("div");

    // Skal bare rendre 2 divs (null skal ikke rendres)
    expect(divs).toHaveLength(2);
    expect(divs[0].textContent).toBe("Storgata 1");
    expect(divs[1].textContent).toBe("3. etasje");
  });

  it("skal hoppe over undefined adresselinjer", () => {
    const adresse = {
      adresselinjer: ["Storgata 1", undefined, "3. etasje"],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);
    const divs = container.querySelectorAll("div");

    // Skal bare rendre 2 divs (undefined skal ikke rendres)
    expect(divs).toHaveLength(2);
  });

  it("skal hoppe over tomme strenger", () => {
    const adresse = {
      adresselinjer: ["Storgata 1", "", "3. etasje"],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);
    const divs = container.querySelectorAll("div");

    // Tom string er falsy, så skal ikke rendres
    expect(divs).toHaveLength(2);
    expect(divs[0].textContent).toBe("Storgata 1");
    expect(divs[1].textContent).toBe("3. etasje");
  });

  it("skal rendre adresselinjer med spesialtegn", () => {
    const adresse = {
      adresselinjer: ["Øvre Slottsgate 1", "3. etasje, leil. Æ-Ø-Å"],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Øvre Slottsgate 1");
    expect(container.textContent).toContain("3. etasje, leil. Æ-Ø-Å");
  });

  it("skal rendre adresselinjer med tall", () => {
    const adresse = {
      adresselinjer: ["Address line 123", "456 Main Street"],
      landkode: "US",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("Address line 123");
    expect(container.textContent).toContain("456 Main Street");
  });

  it("skal rendre landkode med ulike verdier", () => {
    const adresse = {
      adresselinjer: ["Main Street 1"],
      landkode: "USA",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("USA");
  });

  it("skal håndtere landkode som tom string", () => {
    const adresse = {
      adresselinjer: ["Storgata 1"],
      landkode: "",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);
    const addressElement = container.querySelector("address");

    // Tom landkode rendres fortsatt (som tom string)
    expect(addressElement).toBeInTheDocument();
    expect(container.textContent).toContain("Storgata 1");
  });

  it("skal rendre hver adresselinje i egen div", () => {
    const adresse = {
      adresselinjer: ["Line 1", "Line 2"],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);
    const divs = container.querySelectorAll("div");

    expect(divs[0].textContent).toBe("Line 1");
    expect(divs[1].textContent).toBe("Line 2");
  });

  it("skal bruke UUID for keys på adresselinjer", () => {
    const adresse = {
      adresselinjer: ["Line 1", "Line 2"],
      landkode: "NO",
    };

    // Just verify it renders without errors (keys are internal)
    const { container } = render(<UstrukturertAdresse adresse={adresse} />);

    expect(container.querySelector("address")).toBeInTheDocument();
  });

  it("skal rendre landkode etter adresselinjer", () => {
    const adresse = {
      adresselinjer: ["Storgata 1", "0001 Oslo"],
      landkode: "Norge",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);
    const addressElement = container.querySelector("address");

    // Verifiser at landkode kommer til slutt
    expect(addressElement?.textContent).toMatch(/Storgata 1.*0001 Oslo.*Norge/);
  });

  it("skal håndtere lange adresselinjer", () => {
    const adresse = {
      adresselinjer: [
        "This is a very long address line that contains a lot of text and information",
        "Another long line with lots of details",
      ],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("This is a very long address line");
    expect(container.textContent).toContain("Another long line");
  });

  it("skal håndtere adresselinjer med kun mellomrom", () => {
    const adresse = {
      adresselinjer: ["Storgata 1", "   ", "Oslo"],
      landkode: "NO",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);
    const divs = container.querySelectorAll("div");

    // String med kun mellomrom er truthy, så rendres
    expect(divs).toHaveLength(3);
  });

  it("skal rendre komplett utenlandsk adresse", () => {
    const adresse = {
      adresselinjer: ["123 Main Street", "Apartment 4B", "New York, NY 10001", "United States"],
      landkode: "US",
    };

    const { container } = render(<UstrukturertAdresse adresse={adresse} />);

    expect(container.textContent).toContain("123 Main Street");
    expect(container.textContent).toContain("Apartment 4B");
    expect(container.textContent).toContain("New York, NY 10001");
    expect(container.textContent).toContain("United States");
    expect(container.textContent).toContain("US");
  });
});
