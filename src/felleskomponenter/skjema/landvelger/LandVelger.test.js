import React from "react";
import { LandVelger } from "./LandVelger";

describe("Landvelger", () => {
  let props = null;

  beforeEach(() => {
    props = {
      disabled: false,
      feltNavn: "test",
      multiLand: false,
      label: "test",
      landkoder: undefined,
      landkoderFraSakstype: [
        { kode: "kode1", term: "term1" },
        { kode: "kode2", term: "term2" },
        { kode: "kode3", term: "term3" },
      ],
    };
  });

  describe("Dersom multiland prop er false", () => {
    it("viser enkeltland og ikke multiland", () => {
      props.multiLand = false;
      const landVelger = shallow(<LandVelger {...props} />);
      expect(landVelger.find("EnkeltLandWrapper")).toHaveLength(1);
      expect(landVelger.find("MultiLandWrapper")).toHaveLength(0);
    });
  });

  describe("Dersom multiland prop er true", () => {
    it("viser multiland og ikke enkeltland", () => {
      props.multiLand = true;
      const landVelger = shallow(<LandVelger {...props} />);
      expect(landVelger.find("EnkeltLandWrapper")).toHaveLength(0);
      expect(landVelger.find("MultiLandWrapper")).toHaveLength(1);
    });
  });

  it("viser en datalist", () => {
    const landVelger = shallow(<LandVelger {...props} />);
    expect(landVelger.find("datalist")).toHaveLength(1);
  });

  describe("Dersom landkoder prop", () => {
    it("er satt til tom liste", () => {
      props.landkoder = [];
      const landVelger = shallow(<LandVelger {...props} visAlleLandkoder />);

      expect(landVelger.find("datalist").children()).toHaveLength(0);
    });

    it("ikke er satt", () => {
      props.landkoder = undefined;
      const landVelger = shallow(<LandVelger {...props} />);

      expect(landVelger.find("datalist").children()).toHaveLength(props.landkoderFraSakstype.length);
    });
  });
});
