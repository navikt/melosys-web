import React from "react";

import * as Nav from "../../../navFrontend";

import Knapperad from "../../knapperad";
import { shallow } from "enzyme";
import { DialogboksAvslagSoknad } from "./dialogboksAvslagSoknad";

describe("DialogboksAvslagSoknad", () => {
  const props = {
    avbryt: jest.fn(),
    avslaaSoknadHandle: jest.fn(),
    ariaHideApp: false,
    redigerbart: true,
    behandlingID: 1,
    dispatch: jest.fn(),
  };

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
