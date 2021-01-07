import React, { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import * as Mui from "../../../ui";

import EditerbartElement from "./editerbartElement";

describe("EditerbartElement", () => {
  const mockedProps = mock<ComponentProps<typeof EditerbartElement>>();
  const props = instance(mockedProps);

  props.redigerbart = true;

  it("viser innhold etter redigering er utført", () => {
    props.harData = true;
    props.redigeringUtfortRender = jest.fn(() => <span>Redigering utført</span>);
    const editerbartElement = shallow(<EditerbartElement {...props} />);

    expect(editerbartElement.contains("Redigering utført")).toBe(true);
  });

  it("viser innhold for ingen data", () => {
    props.harData = false;
    props.ingenDataRender = jest.fn(() => <span>Ingen data funnet</span>);
    const editerbartElement = shallow(<EditerbartElement {...props} />);

    expect(editerbartElement.contains("Ingen data funnet")).toBe(true);
  });

  it("viser innhold for redigering", () => {
    props.harData = false;
    props.ingenDataRender = (apneRedigering) => {
      apneRedigering();
      return <div />;
    };
    props.redigererRender = jest.fn(() => <span>Redigerer...</span>);
    const editerbartElement = shallow(<EditerbartElement {...props} />);

    expect(editerbartElement.contains("Redigerer...")).toBe(true);
    expect(editerbartElement.find(Mui.Knapp)).toHaveLength(1);
  });
});
