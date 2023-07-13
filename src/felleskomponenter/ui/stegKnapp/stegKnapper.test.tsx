import { ComponentProps } from "react";
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

  it("viser ikke tilbake-knapp når tilbakeknappProps er undefined", () => {
    props.tilbakeKnappProps = undefined;
    const stegKnapper = shallow(<StegKnapper {...props} />);

    const bekreftKnapp = stegKnapper.find(Nav.Hovedknapp);
    const tilbakeKnapp = stegKnapper.find(Nav.Flatknapp);

    expect(bekreftKnapp).toHaveLength(1);
    expect(tilbakeKnapp).toHaveLength(0);
  });

  it("viser tilbake-knapp når tilbakeknappProps er definert", () => {
    props.tilbakeKnappProps = { onClick: vi.fn() };
    const stegKnapper = shallow(<StegKnapper {...props} />);

    const bekreftKnapp = stegKnapper.find(Nav.Hovedknapp);
    const tilbakeKnapp = stegKnapper.find(Nav.Flatknapp);

    expect(bekreftKnapp).toHaveLength(1);
    expect(tilbakeKnapp).toHaveLength(1);
  });
});
