import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import { Bostedsadresse } from "../../../../../../graphql";

import ExpandableList, { ExpandableListProps } from "../../../../../expandablelist";

import Bostedsadresser from "./bostedsadresser";

describe("Bostedsadresser", () => {
  const mockedProps = mock<ComponentProps<typeof Bostedsadresser>>();
  const props = instance(mockedProps);

  const mockedBostedsadresse = mock<Bostedsadresse>();
  const bostedsAdresse = instance(mockedBostedsadresse);

  props.bostedsadresser = [
    { ...bostedsAdresse, erHistorisk: false },
    { ...bostedsAdresse, erHistorisk: true },
  ];

  const bostedsadresser = shallow(<Bostedsadresser {...props} />);

  it("viser aktive bostedsadresser", () => {
    const aktiveBostedsadresserList = bostedsadresser.find<ExpandableListProps<Bostedsadresse>>(ExpandableList).first();
    expect(aktiveBostedsadresserList.props().elements.map((e) => e.erHistorisk)).not.toContain(true);
    expect(aktiveBostedsadresserList.props().elements.map((e) => e.erHistorisk)).toContain(false);
    expect(aktiveBostedsadresserList.props().amountOfItemsCollapsed).toBe(props.bostedsadresser.length);
  });

  it("viser historiske bostedsadresser", () => {
    const historiskeBostedsadresserList = bostedsadresser
      .find<ExpandableListProps<Bostedsadresse>>(ExpandableList)
      .last();
    expect(historiskeBostedsadresserList.props().elements.map((e) => e.erHistorisk)).not.toContain(false);
    expect(historiskeBostedsadresserList.props().elements.map((e) => e.erHistorisk)).toContain(true);
    expect(historiskeBostedsadresserList.props().amountOfItemsCollapsed).toBe(0);
  });

  it("begge lister vises med chevron og divider", () => {
    const bostedsadresserList = bostedsadresser.find(ExpandableList);

    expect(bostedsadresserList.map((list) => list.props().chevron)).toEqual([true, true]);
    expect(bostedsadresserList.map((list) => list.props().dividers)).toEqual([true, true]);
  });
});
