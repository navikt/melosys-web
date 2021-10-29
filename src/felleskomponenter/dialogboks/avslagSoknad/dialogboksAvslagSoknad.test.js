import React from "react";

import * as Nav from "../../../navFrontend";

import { DialogboksAvslagSoknad } from "./dialogboksAvslagSoknad";
import Knapperad from "../../knapperad";

describe("DialogboksAvslagSoknad", () => {
  let props = null;

  beforeEach(() => {
    props = {
      avbryt: jest.fn(),
      redigerbart: true,
      avslaaSoknadHandle: jest.fn(),
      ariaHideApp: false,
      behandlingID: 1,
    };
  });

  it("viser en Nav Modal", () => {
    const dialogboks = shallow(<DialogboksAvslagSoknad {...props} />);
    expect(dialogboks.exists(Nav.Modal)).toBe(true);
  });

  it("sender korrekt handler for avbryting til en knapperad", () => {
    const dialogboks = shallow(<DialogboksAvslagSoknad {...props} />);
    const knapperad = dialogboks.find(Knapperad);

    expect(knapperad).toHaveLength(1);

    const { avbryt } = knapperad.props();

    expect(avbryt).toBe(props.avbryt);
  });
});
