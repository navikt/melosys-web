import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";
import each from "jest-each";

import MKV from "../../melosyskodeverk";

import SemistrukturertAdresse, { PostnrStedLandLinje } from "./semistrukturertAdresse";

describe("SemistrukturertAdresse", () => {
  const mockedProps = mock<ComponentProps<typeof SemistrukturertAdresse>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("viser noen felter for semistrukturert adresse", () => {
    props.adresse = {
      adresselinje1: "Oslogata 1",
      adresselinje2: "Trondheimsgata 1",
      adresselinje3: "Bergensgata 1",
      adresselinje4: "Tromsøgata 1",
    };

    const semistrukturertAdresse = shallow(<SemistrukturertAdresse {...props} />);

    expect(semistrukturertAdresse.text()).toContain("Oslogata 1");
    expect(semistrukturertAdresse.text()).toContain("Trondheimsgata 1");
    expect(semistrukturertAdresse.text()).toContain("Bergensgata 1");
    expect(semistrukturertAdresse.text()).toContain("Tromsøgata 1");
  });

  it("viser et adresse-element", () => {
    const semistrukturertAdresse = shallow(<SemistrukturertAdresse {...props} />);

    expect(semistrukturertAdresse.find("address")).toHaveLength(1);
  });

  it("viser en PostnrStedLandLinje", () => {
    props.adresse = {
      land: MKV.Koder.landkoder.NO,
      postnummer: "0000",
      poststed: "Oslo",
    };

    const semistrukturertAdresse = shallow(<SemistrukturertAdresse {...props} />);

    const postnrStedLandLinje = semistrukturertAdresse.find(PostnrStedLandLinje);
    expect(postnrStedLandLinje).toHaveLength(1);
    expect(postnrStedLandLinje.props().land).toBe(MKV.Koder.landkoder.NO);
    expect(postnrStedLandLinje.props().postnummer).toBe("0000");
    expect(postnrStedLandLinje.props().poststed).toBe("Oslo");
  });

  it("ikke vis PostnrStedLandLinje hvis postnummer, poststed og land mangler", () => {
    props.adresse = {
      land: undefined,
      postnummer: null,
      poststed: null,
    };

    const semistrukturertAdresse = shallow(<SemistrukturertAdresse {...props} />);

    const postnrStedLandLinje = semistrukturertAdresse.find(PostnrStedLandLinje);
    expect(postnrStedLandLinje).toHaveLength(0);
  });

  it("viser ikke null- eller undefined-stringer dersom felter mangler", () => {
    props.adresse = {
      adresselinje1: null,
      adresselinje2: null,
      adresselinje3: null,
      adresselinje4: null,
    };

    const semistrukturertAdresse = shallow(<SemistrukturertAdresse {...props} />);

    expect(semistrukturertAdresse.text()).not.toContain("null");
    expect(semistrukturertAdresse.text()).not.toContain("undefined");
  });
});

describe("PostnrStedLandLinje", () => {
  each([
    [
      {
        postnummer: "1234",
        poststed: "Trondheim",
        land: undefined,
      },
      "1234 Trondheim",
    ],
    [
      {
        postnummer: null,
        poststed: null,
        land: MKV.Koder.landkoder.NO,
      },
      "NO",
    ],
    [
      {
        postnummer: "1234",
        poststed: null,
        land: MKV.Koder.landkoder.NO,
      },
      "1234, NO",
    ],
    [
      {
        postnummer: null,
        poststed: "Trondheim",
        land: MKV.Koder.landkoder.NO,
      },
      "Trondheim, NO",
    ],
    [
      {
        postnummer: "1234",
        poststed: "Trondheim",
        land: MKV.Koder.landkoder.NO,
      },
      "1234 Trondheim, NO",
    ],
  ]).test("for props %s, viser %s", (props, rendretTekst) => {
    const postnrStedLandLinje = shallow(<PostnrStedLandLinje {...props} />);

    expect(postnrStedLandLinje.text()).toBe(rendretTekst);
  });
});
