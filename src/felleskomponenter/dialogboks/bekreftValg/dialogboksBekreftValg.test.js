import React from "react";

import * as Nav from "../../../navFrontend";

import { DialogboksBekreftValg } from "./dialogboksBekreftValg";
import Knapperad from "../../knapperad";

describe("DialogboksFerdigbehandleSak", () => {
  let props = null;

  beforeEach(() => {
    props = {
      avbryt: jest.fn(),
      redigerbart: true,
      ferdigbehandleSak: jest.fn(),
      ariaHideApp: false,
      behandlingID: 1,
    };
  });

  it("viser en Nav Modal", () => {
    const dialogboks = shallow(<DialogboksBekreftValg {...props} />);
    expect(dialogboks.exists(Nav.Modal)).toBe(true);
  });

  it("sender korrekte handlere til en knapperad", () => {
    const dialogboks = shallow(<DialogboksBekreftValg {...props} />);
    const knapperad = dialogboks.find(Knapperad);

    expect(knapperad).toHaveLength(1);

    const { avbryt, bekreft } = knapperad.props();

    expect(avbryt).toBe(props.avbryt);
    expect(bekreft).toBe(props.ferdigbehandleSak);
  });
});
