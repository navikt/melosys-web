import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import { Bostedsadresse } from "../../../../../../graphql";

import ExpandableList, { ExpandableListProps } from "../../../../../expandablelist";

import AdresseTableContainer from "./adresseTableContainer";

describe("AdresseTableContainer", () => {
  const mockedProps = mock<ComponentProps<typeof AdresseTableContainer>>();
  const props = instance(mockedProps);

  const mockedBostedsadresse = mock<Bostedsadresse>();
  const bostedsadresse = instance(mockedBostedsadresse);

  beforeEach(() => {
    props.adresser = [
      { ...bostedsadresse, erHistorisk: false },
      { ...bostedsadresse, erHistorisk: true },
    ];
    props.adressetype = "Bostedsadresse";
  });

  it("viser aktive adresser", () => {
    const adresseliste = shallow(<AdresseTableContainer {...props} />);

    const aktiveAdresserList = adresseliste.find<ExpandableListProps<Bostedsadresse>>(ExpandableList).first();
    expect(aktiveAdresserList.props().elements.map((e) => e.erHistorisk)).not.toContain(true);
    expect(aktiveAdresserList.props().elements.map((e) => e.erHistorisk)).toContain(false);
    expect(aktiveAdresserList.props().amountOfItemsCollapsed).toBe(props.adresser.length);
  });

  it("viser historiske adresser", () => {
    const adresseliste = shallow(<AdresseTableContainer {...props} />);

    const historiskeAdresserList = adresseliste.find<ExpandableListProps<Bostedsadresse>>(ExpandableList).last();
    expect(historiskeAdresserList.props().elements.map((e) => e.erHistorisk)).not.toContain(false);
    expect(historiskeAdresserList.props().elements.map((e) => e.erHistorisk)).toContain(true);
    expect(historiskeAdresserList.props().amountOfItemsCollapsed).toBe(0);
  });

  it("begge lister vises med chevron og divider", () => {
    const adresseliste = shallow(<AdresseTableContainer {...props} />);

    const adresserList = adresseliste.find(ExpandableList);

    expect(adresserList.map((list) => list.props().chevron)).toEqual([true, true]);
    expect(adresserList.map((list) => list.props().dividers)).toEqual([true, true]);
  });
});
