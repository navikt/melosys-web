import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { render } from "@testing-library/react";
import LagretFullmektig from "./lagretFullmektig";
import { Type } from "./types";
import type { BrevAdresse } from "../../../../services/modules/dokumenter-v2";

// Mock dependencies
vi.mock("../../../../resources/images", () => ({
  Fullmakt: () => <div data-testid="fullmakt-icon">Fullmakt Icon</div>,
  GreenCheckmark: () => <div data-testid="checkmark-icon">Checkmark Icon</div>,
}));

vi.mock("../../../../kodeverk", () => ({
  kodeTilTerm: (kode: string) => `Term for ${kode}`,
}));

vi.mock("../../../adresser/brevAdresse", () => ({
  default: ({ mottakerNavn, visNavn }: any) => (
    <div data-testid="brev-adresse">BrevAdresse: {visNavn !== false && mottakerNavn}</div>
  ),
}));

vi.mock("./redigererFullmektig", () => ({
  fullmaktStøtterKontaktperson: (fullmakter: string[]) => fullmakter.includes("TRYGDEAVGIFT"),
}));

// Helper function to create complete BrevAdresse
// All fields are required by the BrevAdresse interface
const createBrevAdresse = (mottakerNavn: string): BrevAdresse => ({
  mottakerNavn,
  orgnr: null,
  adresselinjer: ["Testgate 1"],
  postnr: "0123",
  poststed: "Oslo",
  region: "",
  land: "Norge",
  ugyldig: false,
});

describe("LagretFullmektig", () => {
  describe("ORGANISASJON type", () => {
    it("skal vise organisasjonsnavn", () => {
      const fullmektige = [
        {
          type: Type.ORGANISASJON,
          ident: "123456789",
          adresse: createBrevAdresse("Test Organisasjon AS"),
          fullmakter: ["LOVVALG"],
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText("Test Organisasjon AS")).toBeInTheDocument();
    });

    it("skal vise org.nr", () => {
      const fullmektige = [
        {
          type: Type.ORGANISASJON,
          ident: "987654321",
          adresse: createBrevAdresse("Firma AS"),
          fullmakter: ["LOVVALG"],
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText("Org.nr.:")).toBeInTheDocument();
      expect(screen.getByText("987654321")).toBeInTheDocument();
    });

    it("skal vise BrevAdresse når adresse finnes", () => {
      const fullmektige = [
        {
          type: Type.ORGANISASJON,
          ident: "123456789",
          adresse: createBrevAdresse("Test AS"),
          fullmakter: ["LOVVALG"],
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText(/BrevAdresse:/)).toBeInTheDocument();
    });

    it("skal vise fullmakter", () => {
      const fullmektige = [
        {
          type: Type.ORGANISASJON,
          ident: "123456789",
          adresse: createBrevAdresse("Test AS"),
          fullmakter: ["LOVVALG", "TRYGDEAVGIFT"],
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText("Term for LOVVALG")).toBeInTheDocument();
      expect(screen.getByText("Term for TRYGDEAVGIFT")).toBeInTheDocument();
    });

    it("skal vise kontaktopplysninger når fullmakt støtter det", () => {
      const fullmektige = [
        {
          type: Type.ORGANISASJON,
          ident: "123456789",
          adresse: createBrevAdresse("Test AS"),
          fullmakter: ["TRYGDEAVGIFT"],
          kontaktperson: "Ola Nordmann",
          kontaktTelefon: "12345678",
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText("Kontaktopplysninger")).toBeInTheDocument();
      expect(screen.getByText("Kontaktperson:")).toBeInTheDocument();
      expect(screen.getByText("Ola Nordmann")).toBeInTheDocument();
      expect(screen.getByText("Telefon:")).toBeInTheDocument();
      expect(screen.getByText("12345678")).toBeInTheDocument();
    });
  });

  describe("PERSON type", () => {
    it("skal vise personnavn", () => {
      const fullmektige = [
        {
          type: Type.PERSON,
          ident: "12345678901",
          adresse: createBrevAdresse("Kari Nordmann"),
          fullmakter: ["LOVVALG"],
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText("Kari Nordmann")).toBeInTheDocument();
    });

    it("skal vise F.nr./d-nr. label", () => {
      const fullmektige = [
        {
          type: Type.PERSON,
          ident: "12345678901",
          adresse: createBrevAdresse("Kari Nordmann"),
          fullmakter: ["LOVVALG"],
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText("F.nr./d-nr.:")).toBeInTheDocument();
      expect(screen.getByText("12345678901")).toBeInTheDocument();
    });

    it("skal vise BrevAdresse når adresse finnes", () => {
      const fullmektige = [
        {
          type: Type.PERSON,
          ident: "12345678901",
          adresse: createBrevAdresse("Kari Nordmann"),
          fullmakter: ["LOVVALG"],
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText(/BrevAdresse:/)).toBeInTheDocument();
    });

    it("skal vise fullmakter", () => {
      const fullmektige = [
        {
          type: Type.PERSON,
          ident: "12345678901",
          adresse: createBrevAdresse("Kari Nordmann"),
          fullmakter: ["LOVVALG"],
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText("Term for LOVVALG")).toBeInTheDocument();
    });
  });

  describe("Kontaktperson", () => {
    it("skal vise 'Ingen registrert' når kontaktperson mangler", () => {
      const fullmektige = [
        {
          type: Type.ORGANISASJON,
          ident: "123456789",
          adresse: createBrevAdresse("Test AS"),
          fullmakter: ["TRYGDEAVGIFT"],
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText("Ingen registrert")).toBeInTheDocument();
    });

    it("skal vise kontaktOrgnr når det finnes", () => {
      const fullmektige = [
        {
          type: Type.ORGANISASJON,
          ident: "123456789",
          adresse: createBrevAdresse("Test AS"),
          fullmakter: ["TRYGDEAVGIFT"],
          kontaktOrgnr: "999888777",
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getAllByText("Org.nr.:")).toHaveLength(2);
      expect(screen.getByText("999888777")).toBeInTheDocument();
    });

    it("skal vise kontaktOrgAdresse når både orgnr og adresse finnes", () => {
      const fullmektige = [
        {
          type: Type.ORGANISASJON,
          ident: "123456789",
          adresse: createBrevAdresse("Test AS"),
          fullmakter: ["TRYGDEAVGIFT"],
          kontaktOrgnr: "999888777",
          kontaktOrgAdresse: createBrevAdresse("Kontakt Firma AS"),
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText("(Brev sendes til denne adressen)")).toBeInTheDocument();
    });

    it("skal ikke vise kontaktopplysninger når fullmakt ikke støtter det", () => {
      const fullmektige = [
        {
          type: Type.ORGANISASJON,
          ident: "123456789",
          adresse: createBrevAdresse("Test AS"),
          fullmakter: ["LOVVALG"],
          kontaktperson: "Ola Nordmann",
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.queryByText("Kontaktopplysninger")).not.toBeInTheDocument();
      expect(screen.queryByText("Ola Nordmann")).not.toBeInTheDocument();
    });
  });

  describe("Multiple fullmektige", () => {
    it("skal vise flere fullmektige", () => {
      const fullmektige = [
        {
          type: Type.PERSON,
          ident: "12345678901",
          adresse: createBrevAdresse("Kari Nordmann"),
          fullmakter: ["LOVVALG"],
        },
        {
          type: Type.ORGANISASJON,
          ident: "987654321",
          adresse: createBrevAdresse("Firma AS"),
          fullmakter: ["TRYGDEAVGIFT"],
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText("Kari Nordmann")).toBeInTheDocument();
      expect(screen.getByText("Firma AS")).toBeInTheDocument();
      expect(screen.getByText("12345678901")).toBeInTheDocument();
      expect(screen.getByText("987654321")).toBeInTheDocument();
    });
  });

  describe("CSS classes", () => {
    it("skal ha lagretFullmektig_container class", () => {
      const fullmektige = [
        {
          type: Type.PERSON,
          ident: "12345678901",
          adresse: createBrevAdresse("Kari Nordmann"),
          fullmakter: ["LOVVALG"],
        },
      ];

      const { container } = render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(container.querySelector(".lagretFullmektig_container")).toBeInTheDocument();
    });

    it("skal ha overskrift class", () => {
      const fullmektige = [
        {
          type: Type.PERSON,
          ident: "12345678901",
          adresse: createBrevAdresse("Kari Nordmann"),
          fullmakter: ["LOVVALG"],
        },
      ];

      const { container } = render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(container.querySelector(".overskrift")).toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("skal håndtere tom array", () => {
      const { container } = render(<LagretFullmektig fullmektige={[]} />);

      expect(container.querySelector(".lagretFullmektig_container")).not.toBeInTheDocument();
    });

    it("skal håndtere manglende adresse", () => {
      const fullmektige = [
        {
          type: Type.PERSON,
          ident: "12345678901",
          fullmakter: ["LOVVALG"],
        },
      ];

      render(<LagretFullmektig fullmektige={fullmektige} />);

      expect(screen.getByText("12345678901")).toBeInTheDocument();
      expect(screen.queryByText(/BrevAdresse:/)).not.toBeInTheDocument();
    });
  });
});
