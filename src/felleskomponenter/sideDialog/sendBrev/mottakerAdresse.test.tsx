import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";
import MottakerAdresse from "./mottakerAdresse";

describe("MottakerAdresse", () => {
  const lagProps = () => {
    const mockedProps = mock<ComponentProps<typeof MottakerAdresse>>();
    const propsObject = instance(mockedProps);

    propsObject.tittel = {
      orgnr: "orgnr",
      mottakerNavn: "mottakerNavn",
    };
    return propsObject;
  };

  it("Viser komplett adresse", () => {
    const props = lagProps();
    props.adresselinjer = ["Adresselinje 1", "Adresselinje 2", "Adresselinje 3"];
    props.postnr = "1234";
    props.poststed = "Poststed";
    props.region = "Region";
    props.land = "Land";
    const mottakerAdresse = shallow(<MottakerAdresse {...props} />);

    expect(mottakerAdresse.text()).toBe("Adresselinje 1, Adresselinje 2, Adresselinje 3, 1234 Poststed, Region, Land");
  });

  it("Viser adresse med tomme adresselinje", () => {
    const props = lagProps();
    props.adresselinjer = [];
    props.postnr = "1234";
    props.poststed = "Poststed";
    props.region = "Region";
    props.land = "Land";
    const mottakerAdresse = shallow(<MottakerAdresse {...props} />);

    expect(mottakerAdresse.text()).toBe("1234 Poststed, Region, Land");
  });

  it("Viser adresse med tom region", () => {
    const props = lagProps();
    props.adresselinjer = ["Adresselinje 1", "Adresselinje 2", "Adresselinje 3"];
    props.postnr = "1234";
    props.poststed = "Poststed";
    props.land = "Land";
    const mottakerAdresse = shallow(<MottakerAdresse {...props} />);

    expect(mottakerAdresse.text()).toBe("Adresselinje 1, Adresselinje 2, Adresselinje 3, 1234 Poststed, Land");
  });
});
