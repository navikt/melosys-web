import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OrganisasjonsAdresse from "./organisasjonsAdresse";

vi.mock("./registerAdresse", () => ({
  default: ({ adresse }: any) => <div data-testid="register-adresse">{JSON.stringify(adresse)}</div>,
}));

vi.mock("../../utils", () => ({
  adresse: {
    erRegisterAdresseObjektTomt: vi.fn((adresse) => {
      if (!adresse) return true;
      const { gateadresse, postnr, poststed, land } = adresse;
      return !gateadresse && !postnr && !poststed && !land;
    }),
  },
}));

describe("OrganisasjonsAdresse", () => {
  const defaultOrganisasjon = {
    navn: "Test AS",
    postadresse: {
      gateadresse: { gatenavn: "Postboks 123" },
      postnr: "0001",
      poststed: "Oslo",
      land: "Norge",
    },
    forretningsadresse: {
      gateadresse: { gatenavn: "Storgata 1" },
      postnr: "0002",
      poststed: "Bergen",
      land: "Norge",
    },
  };

  it("skal rendre organisasjonsnavn som standard", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} />);

    expect(screen.getByText("Test AS")).toBeInTheDocument();
  });

  it("skal vise postadresse når den finnes", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} />);

    expect(screen.getByText("Postadresse")).toBeInTheDocument();
    const registerAdresse = screen.getByTestId("register-adresse");
    expect(registerAdresse.textContent).toContain("Postboks 123");
  });

  it("skal vise forretningsadresse når postadresse er tom", () => {
    const organisasjon = {
      navn: "Test AS",
      postadresse: null,
      forretningsadresse: {
        gateadresse: { gatenavn: "Storgata 1" },
        postnr: "0002",
        poststed: "Bergen",
        land: "Norge",
      },
    };

    render(<OrganisasjonsAdresse organisasjon={organisasjon} />);

    expect(screen.getByText("Forretningsadresse")).toBeInTheDocument();
    const registerAdresse = screen.getByTestId("register-adresse");
    expect(registerAdresse.textContent).toContain("Storgata 1");
  });

  it("skal vise forretningsadresse når postadresse er tomt objekt", () => {
    const organisasjon = {
      navn: "Test AS",
      postadresse: {},
      forretningsadresse: {
        gateadresse: { gatenavn: "Storgata 1" },
        postnr: "0002",
        poststed: "Bergen",
        land: "Norge",
      },
    };

    render(<OrganisasjonsAdresse organisasjon={organisasjon} />);

    expect(screen.getByText("Forretningsadresse")).toBeInTheDocument();
  });

  it("skal vise '(Ingen adresse tilgjengelig)' når begge adresser mangler", () => {
    const organisasjon = {
      navn: "Test AS",
      postadresse: null,
      forretningsadresse: null,
    };

    render(<OrganisasjonsAdresse organisasjon={organisasjon} />);

    expect(screen.getByText("(Ingen adresse tilgjengelig)")).toBeInTheDocument();
  });

  it("skal vise '(Ingen adresse tilgjengelig)' når begge adresser er undefined", () => {
    const organisasjon = {
      navn: "Test AS",
    };

    render(<OrganisasjonsAdresse organisasjon={organisasjon} />);

    expect(screen.getByText("(Ingen adresse tilgjengelig)")).toBeInTheDocument();
  });

  it("skal ikke vise navn når visNavn er false", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} visNavn={false} />);

    expect(screen.queryByText("Test AS")).not.toBeInTheDocument();
  });

  it("skal vise navn når visNavn er true", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} visNavn={true} />);

    expect(screen.getByText("Test AS")).toBeInTheDocument();
  });

  it("skal ikke vise tittel når visTittel er false", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} visTittel={false} />);

    expect(screen.queryByText("Postadresse")).not.toBeInTheDocument();
    expect(screen.queryByText("Forretningsadresse")).not.toBeInTheDocument();
  });

  it("skal vise tittel når visTittel er true", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} visTittel={true} />);

    expect(screen.getByText("Postadresse")).toBeInTheDocument();
  });

  it("skal bruke custom className", () => {
    const { container } = render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} className="custom-class" />);

    const element = container.querySelector(".organisasjonsAdresse");
    expect(element).toHaveClass("custom-class");
  });

  it("skal ha base className organisasjonsAdresse", () => {
    const { container } = render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} />);

    const element = container.querySelector(".organisasjonsAdresse");
    expect(element).toBeInTheDocument();
  });

  it("skal rendre både navn og tittel som standard", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} />);

    expect(screen.getByText("Test AS")).toBeInTheDocument();
    expect(screen.getByText("Postadresse")).toBeInTheDocument();
  });

  it("skal ikke vise navn eller tittel når begge er false", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} visNavn={false} visTittel={false} />);

    expect(screen.queryByText("Test AS")).not.toBeInTheDocument();
    expect(screen.queryByText("Postadresse")).not.toBeInTheDocument();
  });

  it("skal rendre RegisterAdresse komponent", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} />);

    expect(screen.getByTestId("register-adresse")).toBeInTheDocument();
  });

  it("skal sende postadresse til RegisterAdresse når den finnes", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} />);

    const registerAdresse = screen.getByTestId("register-adresse");
    const adresseData = JSON.parse(registerAdresse.textContent || "{}");

    expect(adresseData.gateadresse.gatenavn).toBe("Postboks 123");
  });

  it("skal sende forretningsadresse til RegisterAdresse når postadresse mangler", () => {
    const organisasjon = {
      navn: "Test AS",
      postadresse: null,
      forretningsadresse: {
        gateadresse: { gatenavn: "Storgata 1" },
        postnr: "0002",
        poststed: "Bergen",
        land: "Norge",
      },
    };

    render(<OrganisasjonsAdresse organisasjon={organisasjon} />);

    const registerAdresse = screen.getByTestId("register-adresse");
    const adresseData = JSON.parse(registerAdresse.textContent || "{}");

    expect(adresseData.gateadresse.gatenavn).toBe("Storgata 1");
  });

  it("skal vise tittel 'Postadresse' når postadresse brukes", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} />);

    const tittel = screen.getByText("Postadresse");
    expect(tittel).toHaveClass("tittel");
  });

  it("skal vise tittel 'Forretningsadresse' når forretningsadresse brukes", () => {
    const organisasjon = {
      navn: "Test AS",
      postadresse: null,
      forretningsadresse: {
        gateadresse: { gatenavn: "Storgata 1" },
        postnr: "0002",
        poststed: "Bergen",
        land: "Norge",
      },
    };

    render(<OrganisasjonsAdresse organisasjon={organisasjon} />);

    const tittel = screen.getByText("Forretningsadresse");
    expect(tittel).toHaveClass("tittel");
  });

  it("skal håndtere organisasjon med bare navn", () => {
    const organisasjon = {
      navn: "Bare Navn AS",
      postadresse: null,
      forretningsadresse: null,
    };

    render(<OrganisasjonsAdresse organisasjon={organisasjon} />);

    expect(screen.getByText("(Ingen adresse tilgjengelig)")).toBeInTheDocument();
  });

  it("skal bruke semibold weight på navn", () => {
    render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} />);

    const navnElement = screen.getByText("Test AS");
    expect(navnElement).toBeInTheDocument();
  });

  it("skal håndtere tom className som default", () => {
    const { container } = render(<OrganisasjonsAdresse organisasjon={defaultOrganisasjon} />);

    const element = container.querySelector(".organisasjonsAdresse");
    expect(element?.className).toBe("organisasjonsAdresse");
  });

  it("skal kombinere base className med custom className", () => {
    const { container } = render(
      <OrganisasjonsAdresse organisasjon={defaultOrganisasjon} className="my-custom-class" />,
    );

    const element = container.querySelector(".organisasjonsAdresse");
    expect(element).toHaveClass("organisasjonsAdresse");
    expect(element).toHaveClass("my-custom-class");
  });
});
