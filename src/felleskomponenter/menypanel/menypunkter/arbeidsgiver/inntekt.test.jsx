import HighchartsReact from "highcharts-react-official";

import * as Nav from "../../../../navFrontend";

import TabellArbeidsgiver from "./tabellArbeidsgiver";
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
    const graf = inntekt.find(HighchartsReact);

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

    const event = { preventDefault: vi.fn() };
    knapp.simulate("click", event);

    expect(inntekt.find(TabellArbeidsgiver)).toHaveLength(1);
  });
});
