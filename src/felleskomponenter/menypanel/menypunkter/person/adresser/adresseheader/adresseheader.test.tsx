import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import * as Nav from "../../../../../../utils/navFrontend";

import Adresserad from "../adresserad";
import Adresseheader, { Adressetype } from "./adresseheader";

describe("Adresseheader", () => {
  const mockedProps = mock<ComponentProps<typeof Adresseheader>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser en Adresserad med kolonner", () => {
    props.adressetype = Adressetype.Bostedsadresse;

    const adresseheader = shallow(<Adresseheader {...props} />);

    const adresserad = adresseheader.find(Adresserad);
    const { kolonner } = adresserad.props();

    expect(adresserad).toHaveLength(1);
    expect(kolonner).toEqual([
      {
        innhold: <Nav.Typo.Element>{Adressetype.Bostedsadresse}</Nav.Typo.Element>,
        bredde: "3",
      },
      {
        innhold: <Nav.Typo.Element>Register</Nav.Typo.Element>,
        bredde: "3",
      },
      {
        innhold: <Nav.Typo.Element>Kilde</Nav.Typo.Element>,
        bredde: "3",
      },
      {
        innhold: <Nav.Typo.Element>Gyldig f.o.m.</Nav.Typo.Element>,
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

    expect(kolonner[kolonner.length - 1].innhold).toEqual(<Nav.Typo.Element>Gyldig f.o.m. - t.o.m.</Nav.Typo.Element>);
  });
});
