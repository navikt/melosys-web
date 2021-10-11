import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import MKV from "../../melosyskodeverk";

import SemistrukturertAdresse from "./semistrukturertAdresse";

describe("SemistrukturertAdresse", () => {
  const mockedProps = mock<ComponentProps<typeof SemistrukturertAdresse>>();
  const props = instance(mockedProps);

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

  it("viser alle felter for semistrukturert adresse", () => {
    expect(semistrukturertAdresse.contains("Oslogata 1")).toBe(true);
    expect(semistrukturertAdresse.contains("Trondheimsgata 1")).toBe(true);
    expect(semistrukturertAdresse.contains("Bergensgata 1")).toBe(true);
    expect(semistrukturertAdresse.contains("Tromsøgata 1")).toBe(true);
    expect(semistrukturertAdresse.contains(`0000 Oslo, ${MKV.Koder.landkoder.NO}`)).toBe(true);
  });

  it("viser et adresse-element", () => {
    expect(semistrukturertAdresse.find("address")).toHaveLength(1);
  });
});
