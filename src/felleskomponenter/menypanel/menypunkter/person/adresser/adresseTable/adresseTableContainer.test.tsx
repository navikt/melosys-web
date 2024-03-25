import AdresseTableContainer from "./adresseTableContainer";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect } from "vitest";

describe("AdresseTableContainer", () => {
  const props = {
    adressetype: "Bostedsadresse",
    adresser: [
      {
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
        gyldigFraOgMed: "1995-06-16",
        gyldigTilOgMed: null,
        kilde: "Folkeregisteret",
        master: "FREG",
        erHistorisk: false,
      },
      {
        coAdressenavn: null,
        adresse: {
          tilleggsnavn: "tilleggg navn",
          gatenavn: null,
          husnummerEtasjeLeilighet: null,
          postboks: null,
          postnummer: "2414",
          poststed: "ELVERUM",
          region: null,
          land: "NORGE",
        },
        gyldigFraOgMed: "1957-09-12",
        gyldigTilOgMed: null,
        kilde: "Folkeregisteret",
        master: "FREG",
        erHistorisk: true,
      },
    ],
  };

  it("snapshot test", () => {
    const { container } = render(<AdresseTableContainer {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("snapshot test historisk åpnet", () => {
    const { container } = render(<AdresseTableContainer {...props} />);
    fireEvent.click(screen.getByText("Åpne historikk"));
    expect(container).toMatchSnapshot();
  });
});
