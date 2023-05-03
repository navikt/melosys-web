import React from "react";
import { shallow } from "enzyme";

import * as Utils from "../../utils";

import { Sok } from "./sok";
import SorterbarListe from "../../felleskomponenter/sorterbarListe";

describe("Sok", () => {
  let props: { sokResultat: any[]; sok: jest.Mock<any, any> };

  const getItemPrototype = Storage.prototype.getItem;

  beforeEach(() => {
    props = {
      sokResultat: [],
      sok: jest.fn(),
    };
  });

  afterAll(() => {
    Storage.prototype.getItem = getItemPrototype;
  });

  it("viser en sorterbarliste ved søk på fnr med ett resultat", () => {
    const generator = new Utils.testhelpers.Generator();
    Storage.prototype.getItem = jest.fn(() => generator.generateBirthNumber());
    props.sokResultat = [
      {
        saksnummer: "",
      },
    ];
    const sok = shallow(<Sok landkoder={[]} hentLandkoder={() => Promise.resolve()} {...props} />);

    const sorterbarListe = sok.find(SorterbarListe);
    const sorterbarListeProps = sorterbarListe.props();

    expect(sorterbarListe).toHaveLength(1);
    expect(sorterbarListeProps.elementer).toBe(props.sokResultat);
  });

  it("viser ikke sorterbarliste ved søk på fnr uten resultat", () => {
    const generator = new Utils.testhelpers.Generator();
    Storage.prototype.getItem = jest.fn(() => generator.generateBirthNumber());
    const sok = shallow(<Sok landkoder={[]} hentLandkoder={() => Promise.resolve()} {...props} />);

    const sorterbarListe = sok.find(SorterbarListe);

    expect(sorterbarListe).toHaveLength(0);
  });
});
