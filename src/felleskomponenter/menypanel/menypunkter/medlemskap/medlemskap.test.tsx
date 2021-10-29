import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import * as Nav from "../../../../navFrontend";

import { Medlemskap, MedlemskapGruppe, MedlemskapEnkeltPeriode } from "./medlemskap";

import ExpandableList from "../../../expandablelist";

describe("Medlemskap", () => {
  const mockedProps = mock<ComponentProps<typeof Medlemskap>>();
  const props = instance(mockedProps);

  beforeEach(() => {
    props.medlemskap = {
      perioderMed: [],
      perioderUten: [],
    };
  });

  it("Viser to medlemskapsgrupper", () => {
    const medlemskap = shallow(<Medlemskap {...props} />);
    const medlemskapsgrupper = medlemskap.find(MedlemskapGruppe);

    expect(medlemskapsgrupper).toHaveLength(2);
    expect(medlemskapsgrupper.first().props().perioder).toBe(props.medlemskap.perioderMed);
    expect(medlemskapsgrupper.at(1).props().perioder).toBe(props.medlemskap.perioderUten);
  });
});

describe("MedlemskapGruppe", () => {
  const mockedProps = mock<ComponentProps<typeof MedlemskapGruppe>>();
  const props = instance(mockedProps);

  beforeEach(() => {
    props.perioder = [];
    props.overskrift = "overskrift";
  });

  it("viser overskrift", () => {
    const medlemskapGruppe = shallow(<MedlemskapGruppe {...props} />);
    const overskrift = medlemskapGruppe.find(Nav.Typo.Undertittel);

    expect(overskrift).toHaveLength(1);
    expect(overskrift.children().text()).toBe(props.overskrift);
  });

  it("viser en ExpandableList med gitte perioder", () => {
    const mockedPeriode = mock<typeof mockedProps.perioder[0]>();
    const periode1 = instance(mockedPeriode);
    periode1.periodeID = 1;
    const periode2 = instance(mockedPeriode);
    periode2.periodeID = 2;
    props.perioder = [periode1, periode2];
    const medlemskapGruppe = shallow(<MedlemskapGruppe {...props} />);
    const expandableList = medlemskapGruppe.find(ExpandableList);
    const expandableListProps = expandableList.props();

    expect(expandableList).toHaveLength(1);
    expect(expandableListProps.elements).toBe(props.perioder);
  });

  it("viser infomelding dersom ingen perioder oppgitt", () => {
    const medlemskapGruppe = shallow(<MedlemskapGruppe {...props} />);
    const section = medlemskapGruppe.find("section");

    expect(section.children().text()).toBe("(ingen data funnet)");
  });
});

describe("MedlemskapEnkeltPeriode", () => {
  const mockedProps = mock<ComponentProps<typeof MedlemskapEnkeltPeriode>>();
  const props = instance(mockedProps);
  const mockedPeriode = mock<typeof mockedProps.enkeltPeriode>();
  const periode = instance(mockedPeriode);
  props.enkeltPeriode = periode;

  it("vises uten å krasje", () => {
    shallow(<MedlemskapEnkeltPeriode {...props} />);
  });
});
