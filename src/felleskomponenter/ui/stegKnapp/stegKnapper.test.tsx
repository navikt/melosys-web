import React, { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";
import { shallow } from "enzyme";

import * as Nav from "../../../navFrontend";
import StegKnapper from "./stegKnapper";

describe("stegKnapper", () => {
  const mockedProps = mock<ComponentProps<typeof StegKnapper>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.bekreftKnappProps = {};
  });

  it("viser ikke tilbake-knapp når visTilbakeKnapp = false", () => {
    props.visTilbakeKnapp = false;
    const stegKnapper = shallow(<StegKnapper {...props} />);

    const bekreftKnapp = stegKnapper.find(Nav.Hovedknapp);
    const tilbakeKnapp = stegKnapper.find(Nav.Flatknapp);

    expect(bekreftKnapp).toHaveLength(1);
    expect(tilbakeKnapp).toHaveLength(0);
  });

  it("viser tilbake-knapp når visTilbakeKnapp = true", () => {
    props.visTilbakeKnapp = true;
    props.tilbakeKnappProps = {};
    const stegKnapper = shallow(<StegKnapper {...props} />);

    const bekreftKnapp = stegKnapper.find(Nav.Hovedknapp);
    const tilbakeKnapp = stegKnapper.find(Nav.Flatknapp);

    expect(bekreftKnapp).toHaveLength(1);
    expect(tilbakeKnapp).toHaveLength(1);
  });
});
