import React from "react";
import ReactHighcharts from "react-highcharts";

import * as Nav from "../../../../utils/navFrontend";

import Tabell from "../../../tabell/tabell";
import Inntekt from "./inntekt";

describe("inntekt", () => {
  let props = null;

  beforeEach(() => {
    props = {
      inntektListe: [],
    };
  });

  it("viser ingenting ved tom inntektliste", () => {
    const inntekt = shallow(<Inntekt {...props} />);

    expect(inntekt.isEmptyRender()).toBe(true);
  });

  it("viser en graf dersom det finnes minst 1 inntekt", () => {
    props.inntektListe = [
      {
        beloep: 10000,
      },
    ];
    const inntekt = shallow(<Inntekt {...props} />);
    const graf = inntekt.find(ReactHighcharts);

    expect(graf).toHaveLength(1);
  });

  it("viser tabell ved klikk på knapp", () => {
    props.inntektListe = [
      {
        beloep: 10000,
      },
    ];
    const inntekt = shallow(<Inntekt {...props} />);
    const knapp = inntekt.find(Nav.Knapp);

    const event = { preventDefault: jest.fn() };
    knapp.simulate("click", event);

    expect(inntekt.find(Tabell)).toHaveLength(1);
  });
});
