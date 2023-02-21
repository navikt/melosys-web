import React from "react";

import * as Nav from "../../../navFrontend";

import { DialogboksBekreftValg } from "./dialogboksBekreftValg";
import Knapperad from "../../knapperad";

describe("DialogboksBekreftValg", () => {
  let props = null;

  beforeEach(() => {
    props = {
      avbrytCallback: jest.fn(),
      bekreftCallback: jest.fn(),
      redigerbart: true,
      ariaHideApp: false,
      behandlingID: 1,
      tittel: "title",
      tekst: "texty text",
    };
  });

  it("viser en Nav Modal", () => {
    const dialogboks = shallow(<DialogboksBekreftValg {...props} />);
    expect(dialogboks.exists(Nav.Modal)).toBe(true);
  });

  it("sender korrekte handlere til en knapperad", () => {
    const dialogboks = shallow(<DialogboksBekreftValg {...props} />);
    const knapperad = dialogboks.find(Knapperad);
    const systemTittel = dialogboks.find(Nav.Typo.Systemtittel);
    const normalTekst = dialogboks.find(Nav.Typo.Normaltekst);

    expect(knapperad).toHaveLength(1);

    const { avbryt, bekreft } = knapperad.props();

    expect(avbryt).toBe(props.avbrytCallback);
    expect(bekreft).toBe(props.bekreftCallback);
    expect(systemTittel.getNodeInternal().props.children).toBe(props.tittel);
    expect(normalTekst.getNodeInternal().props.children).toBe(props.tekst);
  });
});
