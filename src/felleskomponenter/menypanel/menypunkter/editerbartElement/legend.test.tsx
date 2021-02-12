import React, { ComponentProps } from "react";
import { mock, instance } from "ts-mockito";
import { shallow } from "enzyme";

import * as Symboler from "../symboler";

import Legend from "./legend";

describe("Legend", () => {
  const mockedProps = mock<ComponentProps<typeof Legend>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = instance(mockedProps);
  });

  it("Viser ingen symboler hvis ikke redigerbart", () => {
    props.redigerbart = false;
    const legend = shallow(<Legend {...props} />);

    expect(legend.find(Symboler.Rediger)).toHaveLength(0);
    expect(legend.find(Symboler.Slett)).toHaveLength(0);
  });

  it("symbolsynlighet-prop styrer visning av symboler", () => {
    props.symbolsynlighet = { pencil: true, bin: true };
    props.redigerbart = true;
    let legend = shallow(<Legend {...props} />);

    expect(legend.find(Symboler.Rediger)).toHaveLength(1);
    expect(legend.find(Symboler.Slett)).toHaveLength(1);

    props.symbolsynlighet = { pencil: false, bin: false };
    legend = shallow(<Legend {...props} />);

    expect(legend.find(Symboler.Rediger)).toHaveLength(0);
    expect(legend.find(Symboler.Slett)).toHaveLength(0);
  });
});
