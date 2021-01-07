import React from "react";
import { FieldArray } from "redux-form";

import EditerbartElementListe, { InnerEditerbartElementListe } from "./editerbartElementListe";
import FlereRedigeringsknapperListe from "./flereRedigeringsknapperListe";
import EnRedigeringsknappListe from "./enRedigeringsknappListe";

describe("EditerbartElementListe", () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: "arbeidUtland",
    };
  });

  it("viser en fieldArray", () => {
    const editerbartElementListe = shallow(<EditerbartElementListe {...props} />);
    const fieldArray = editerbartElementListe.find(FieldArray);
    const fieldArrayProps = fieldArray.props();

    expect(fieldArray).toHaveLength(1);
    expect(fieldArrayProps.name).toBe(props.feltNavn);
  });
});

describe("InnerElementlListe", () => {
  let props = null;

  const TestElement = () => <div>Element</div>;

  beforeEach(() => {
    props = {
      leggTilTekst: "Legg til",
      slettTekst: "Slett",
      redigerbart: true,
      fields: {
        getAll: jest.fn(() => [{}, {}]),
        name: "liste",
        remove: jest.fn(),
        push: jest.fn(),
      },
      elementClassName: "elementClassName",
      defaultElement: {},
      className: "className",
      settFeltVerdi: jest.fn(),
      hentNavn: jest.fn(() => "Navn"),
      tittelTekst: "tittel",
      redigererKomponent: () => TestElement,
      redigeringUtfortKomponent: () => TestElement,
      harData: () => true,
      tittelIkon: () => <div />,
    };
  });

  it("viser en FlereRedigeringsknapperListe", () => {
    props.flereRedigeringsknapper = true;
    const innerEditerbartElementListe = shallow(<InnerEditerbartElementListe {...props} />);
    const liste = innerEditerbartElementListe.find(FlereRedigeringsknapperListe);

    expect(liste).toHaveLength(1);
  });

  it("viser en EnRedigeringsknappListe", () => {
    props.flereRedigeringsknapper = false;
    const innerEditerbartElementListe = shallow(<InnerEditerbartElementListe {...props} />);
    const liste = innerEditerbartElementListe.find(EnRedigeringsknappListe);

    expect(liste).toHaveLength(1);
  });
});
