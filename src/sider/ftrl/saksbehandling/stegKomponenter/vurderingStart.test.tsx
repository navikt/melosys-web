import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";
import each from "jest-each";

import * as Nav from "../../../../navFrontend";

import MKV from "../../../../melosyskodeverk";
import { VurderingStart } from "./vurderingStart";

const { CH, DK } = MKV.Koder.landkoder;
const { AU } = MKV.Koder.avtaleland;

describe("VurderingStart", () => {
  const mockedProps = mock<ComponentProps<typeof VurderingStart>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
    props.trygdedekninger = [];
  });

  each([
    CH, // eøs-forordning
    DK, // eøs-forordning
    AU, // trygdeavtale
  ]).it("viser advarsel dersom land som er dekket av trygdeavtale eller del av EØS-forordning er valgt", (landKode) => {
    props.formValues = {
      land: landKode,
    };
    const vurderingStart = shallow(<VurderingStart {...props} />);

    const alertstripe = vurderingStart.findWhere(
      (n) =>
        n.type() === Nav.AlertStripe &&
        n.children().text() === "Landet er et EØS-land og/eller et land Norge har trygdeavtale med"
    );
    expect(alertstripe).toHaveLength(1);
  });

  it("viser ikke advarsel dersom land som er valgt ikke er dekket av en trygdeavtale eller del av EØS-forordning", () => {
    const kinaLandKode = "CN";
    props.formValues = {
      land: kinaLandKode,
    };

    const vurderingStart = shallow(<VurderingStart {...props} />);

    const alertstripe = vurderingStart.findWhere(
      (n) =>
        n.type() === Nav.AlertStripe &&
        n.children().text() === "Landet er et EØS-land og/eller et land Norge har trygdeavtale med"
    );
    expect(alertstripe).toHaveLength(0);
  });
});
