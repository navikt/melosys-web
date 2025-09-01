import AdresseTable from "./adresseTable";
import { render } from "@testing-library/react";

const aktivBostedsadresse = {
  coAdressenavn: "Co Yo 1",
  adresse: {
    tilleggsnavn: null,
    gatenavn: "bosted gata 3",
    husnummerEtasjeLeilighet: "42",
    postboks: null,
    postnummer: "0001",
    poststed: null,
    region: null,
    land: "STORBRITANNIA",
  },
  gyldigFraOgMed: "2012-11-03",
  gyldigTilOgMed: null,
  kilde: "Folkeregisteret",
  master: "Freg",
  erHistorisk: false,
};

const historiskBostedsadresse = {
  coAdressenavn: "Co Yo 1",
  adresse: {
    tilleggsnavn: null,
    gatenavn: "bosted gata 3",
    husnummerEtasjeLeilighet: "42",
    postboks: null,
    postnummer: "0001",
    poststed: null,
    region: null,
    land: "STORBRITANNIA",
  },
  gyldigFraOgMed: "2012-11-03",
  gyldigTilOgMed: "2020-11-03",
  kilde: "Folkeregisteret",
  master: "Freg",
  erHistorisk: true,
};

describe("AdresseTable ", () => {
  it("aktiv AdresseTable renders correctly", () => {
    const { container } = render(<AdresseTable adressetype="Bostedsadresse" adresser={[aktivBostedsadresse]} />);
    expect(container).toMatchSnapshot();
  });

  it("historisk AdresseTable renders correctly", () => {
    const { container } = render(
      <AdresseTable adressetype="Bostedsadresse" adresser={[historiskBostedsadresse]} historisk />,
    );
    expect(container).toMatchSnapshot();
  });
});
