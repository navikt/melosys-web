import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import each from "jest-each";

// eslint-disable-next-line no-restricted-imports
import { shallow } from "enzyme";
import * as Nav from "../../../../navFrontend";

import MKV from "../../../../melosyskodeverk";
import { VurderingStart } from "./vurderingStart";

const { CH, DK } = MKV.Koder.landkoder;
const { AU } = MKV.Koder.trygdeavtale_myndighetsland;

describe.skip("VurderingStart", () => {
  const mockedProps = mock<ComponentProps<typeof VurderingStart>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  each([
    CH, // eøs-forordning
    DK, // eøs-forordning
    AU, // trygdeavtale
  ]).it("viser advarsel dersom land som er dekket av trygdeavtale eller del av EØS-forordning er valgt", () => {
    const vurderingStart = shallow(<VurderingStart {...props} />);

    const alertstripe = vurderingStart.findWhere(
      (n) =>
        n.type() === Nav.AlertStripeAdvarsel &&
        n.children().text() === "Landet er et EØS-land og/eller et land Norge har trygdeavtale med"
    );
    expect(alertstripe).toHaveLength(1);
  });

  it("viser ikke advarsel dersom land som er valgt ikke er dekket av en trygdeavtale eller del av EØS-forordning", () => {
    const vurderingStart = shallow(<VurderingStart {...props} />);

    const alertstripe = vurderingStart.findWhere(
      (n) =>
        n.type() === Nav.AlertStripeAdvarsel &&
        n.children().text() === "Landet er et EØS-land og/eller et land Norge har trygdeavtale med"
    );
    expect(alertstripe).toHaveLength(0);
  });
});
