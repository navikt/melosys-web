import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import Adresserad from "../adresserad";
import Adresseheader, { Adressetype } from "./adresseheader";

describe("Adresseheader", () => {
  const mockedProps = mock<ComponentProps<typeof Adresseheader>>();
  const props = instance(mockedProps);

  it("viser en Adresserad med kolonner", () => {
    props.adressetype = Adressetype.Bostedsadresse;

    const adresseheader = shallow(<Adresseheader {...props} />);

    const adresserad = adresseheader.find(Adresserad);
    const { kolonner } = adresserad.props();

    expect(adresserad).toHaveLength(1);
    expect(kolonner).toEqual([
      {
        innhold: Adressetype.Bostedsadresse,
        bredde: "3",
      },
      {
        innhold: "Register",
        bredde: "3",
      },
      {
        innhold: "Kilde",
        bredde: "3",
      },
      {
        innhold: "Gyldig f.o.m.",
        bredde: "3",
      },
    ]);
  });

  it("tillater at man kan vise t.o.m.-tekst", () => {
    props.adressetype = Adressetype.Kontaktadresse;
    props.visTom = true;

    const adresseheader = shallow(<Adresseheader {...props} />);

    const adresserad = adresseheader.find(Adresserad);
    const { kolonner } = adresserad.props();

    expect(kolonner[kolonner.length - 1]).toEqual({
      innhold: "Gyldig f.o.m. - t.o.m.",
      bredde: "3",
    });
  });
});
