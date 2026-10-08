import { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";

import { HentAdresserQuery } from "./hentAdresser";
import { Adresser } from "./adresser";

describe("Adresser", () => {
  let props: ComponentProps<typeof Adresser>;

  const bostedsadresser: HentAdresserQuery["hentSaksopplysninger"]["persondata"]["bostedsadresser"] = [
    {
      coAdressenavn: "Co Adresse",
      adresse: {
        tilleggsnavn: null,
        gatenavn: "Testgata",
        husnummerEtasjeLeilighet: "1",
        postboks: null,
        postnummer: "0001",
        poststed: "Oslo",
        region: null,
        land: "NO",
      },
      gyldigFraOgMed: "2020-01-01",
      gyldigTilOgMed: null,
      kilde: "Folkeregisteret",
      master: "Freg",
      erHistorisk: false,
    },
  ];

  const oppholdsadresser: HentAdresserQuery["hentSaksopplysninger"]["persondata"]["oppholdsadresser"] = [
    {
      coAdressenavn: "Co Opphold",
      adresse: {
        tilleggsnavn: null,
        gatenavn: "Oppholdsgata",
        husnummerEtasjeLeilighet: "2",
        postboks: null,
        postnummer: "0002",
        poststed: "Oslo",
        region: null,
        land: "NO",
      },
      gyldigFraOgMed: "2020-01-01",
      gyldigTilOgMed: null,
      kilde: "Folkeregisteret",
      master: "Freg",
      erHistorisk: false,
    },
  ];

  const kontaktadresser: HentAdresserQuery["hentSaksopplysninger"]["persondata"]["kontaktadresser"] = [
    {
      coAdressenavn: "Co Kontakt",
      strukturertAdresse: {
        tilleggsnavn: null,
        gatenavn: "Kontaktgata",
        husnummerEtasjeLeilighet: "3",
        postboks: null,
        postnummer: "0003",
        poststed: "Oslo",
        region: null,
        land: "NO",
      },
      semistrukturertAdresse: null,
      gyldigFraOgMed: "2020-01-01",
      gyldigTilOgMed: null,
      kilde: "Folkeregisteret",
      master: "Freg",
      erHistorisk: false,
    },
  ];

  beforeEach(() => {
    props = {} as ComponentProps<typeof Adresser>;
    props.data = {
      hentSaksopplysninger: {
        persondata: {
          bostedsadresser,
          oppholdsadresser,
          kontaktadresser,
        },
      },
    };
  });

  it("viser tabell for hver adressetype hvis de finnes", () => {
    render(<Adresser {...props} />);

    expect(screen.getAllByRole("table")).toHaveLength(3);
    expect(screen.getByText("Bostedsadresse")).toBeDefined();
    expect(screen.getByText("Oppholdsadresse")).toBeDefined();
    expect(screen.getByText("Kontaktadresse")).toBeDefined();
  });

  it("viser ikke tabell for adresser hvis ingen finnes", () => {
    props.data.hentSaksopplysninger.persondata.bostedsadresser = [];
    props.data.hentSaksopplysninger.persondata.oppholdsadresser = [];
    props.data.hentSaksopplysninger.persondata.kontaktadresser = [];

    render(<Adresser {...props} />);

    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText("Bostedsadresse")).toBeNull();
    expect(screen.queryByText("Oppholdsadresse")).toBeNull();
    expect(screen.queryByText("Kontaktadresse")).toBeNull();
  });
});
