import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import MKV from "../../melosyskodeverk";

import SemistrukturertAdresse from "./semistrukturertAdresse";

describe("SemistrukturertAdresse", () => {
  const mockedProps = mock<ComponentProps<typeof SemistrukturertAdresse>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser alle felter for semistrukturert adresse", () => {
    props.adresse = {
      adresselinje1: "Oslogata 1",
      adresselinje2: "Trondheimsgata 1",
      adresselinje3: "Bergensgata 1",
      adresselinje4: "Tromsøgata 1",
      land: MKV.Koder.landkoder.NO,
      postnummer: "0000",
      poststed: "Oslo",
    };

    const semistrukturertAdresse = shallow(<SemistrukturertAdresse {...props} />);

    expect(semistrukturertAdresse.contains("Oslogata 1")).toBe(true);
    expect(semistrukturertAdresse.contains("Trondheimsgata 1")).toBe(true);
    expect(semistrukturertAdresse.contains("Bergensgata 1")).toBe(true);
    expect(semistrukturertAdresse.contains("Tromsøgata 1")).toBe(true);
    expect(semistrukturertAdresse.contains(`0000 Oslo, ${MKV.Koder.landkoder.NO}`)).toBe(true);
  });

  it("viser et adresse-element", () => {
    const semistrukturertAdresse = shallow(<SemistrukturertAdresse {...props} />);

    expect(semistrukturertAdresse.find("address")).toHaveLength(1);
  });

  it("viser ikke null- eller undefined-stringer dersom felter er null eller undefined", () => {
    props.adresse = {
      adresselinje1: null,
      adresselinje2: null,
      adresselinje3: null,
      adresselinje4: null,
      land: undefined,
      postnummer: null,
      poststed: null,
    };

    const semistrukturertAdresse = shallow(<SemistrukturertAdresse {...props} />);

    expect(semistrukturertAdresse.text()).not.toContain("null");
    expect(semistrukturertAdresse.text()).not.toContain("undefined");
  });

  it("viser ikke komma dersom land mangler", () => {
    props.adresse.postnummer = "1234";
    props.adresse.poststed = "Trondheim";
    props.adresse.land = undefined;

    const semistrukturertAdresse = shallow(<SemistrukturertAdresse {...props} />);

    expect(semistrukturertAdresse.text()).not.toContain(",");
  });

  it("viser ikke komma dersom postnummer og poststed mangler", () => {
    props.adresse.postnummer = null;
    props.adresse.poststed = null;
    props.adresse.land = MKV.Koder.landkoder.NO;

    const semistrukturertAdresse = shallow(<SemistrukturertAdresse {...props} />);

    expect(semistrukturertAdresse.text()).not.toContain(",");
  });

  it("viser komma dersom bare poststed mangler", () => {
    props.adresse.postnummer = "1234";
    props.adresse.poststed = null;
    props.adresse.land = MKV.Koder.landkoder.NO;

    const semistrukturertAdresse = shallow(<SemistrukturertAdresse {...props} />);

    expect(semistrukturertAdresse.text()).toContain(",");
  });
});
