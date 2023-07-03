import { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";
import each from "jest-each";

import * as Mui from "../../../ui";
import * as Nav from "../../../../navFrontend";

import EditerbartElement from "./editerbartElement";
import { Status } from "./types";

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

  describe("legend", () => {
    each([
      {
        pencil: false,
        bin: false,
      },
    ]).it("default symbolsynlighet ved redigering er %p", (forventetSymbolsynlighet) => {
      props.harData = false;
      props.redigererRender = jest.fn(() => <span />);
      const editerbartElement = shallow(<EditerbartElement {...props} />);
      const { legend } = editerbartElement.find(Nav.Fieldset).props();

      expect((legend as any).props.symbolsynlighet).toEqual(forventetSymbolsynlighet);
    });

    each([
      {
        pencil: false,
        bin: false,
      },
    ]).it("default symbolsynlighet ved ingen data er %p", (forventetSymbolsynlighet) => {
      props.harData = false;
      props.ingenDataRender = () => <span />;
      const editerbartElement = shallow(<EditerbartElement {...props} />);
      const { legend } = editerbartElement.find(Nav.Fieldset).props();

      expect((legend as any).props.symbolsynlighet).toEqual(forventetSymbolsynlighet);
    });

    each([
      {
        pencil: true,
        bin: true,
      },
    ]).it("default symbolsynlighet ved redigering utført er %p", (forventetSymbolsynlighet) => {
      props.harData = true;
      props.redigeringUtfortRender = jest.fn(() => <span>Redigering utført</span>);
      const editerbartElement = shallow(<EditerbartElement {...props} />);
      const { legend } = editerbartElement.find(Nav.Fieldset).props();

      expect((legend as any).props.symbolsynlighet).toEqual(forventetSymbolsynlighet);
    });

    it("får symbolsynlighet satt ved symbolsynlighet-prop", () => {
      const forventetSymbolsynlighet = { pencil: false, bin: false };
      props.symbolsynlighet = { [Status.RedigeringUtfort]: forventetSymbolsynlighet };
      props.harData = true;
      props.redigeringUtfortRender = jest.fn(() => <span>Redigering utført</span>);
      const editerbartElement = shallow(<EditerbartElement {...props} />);
      const { legend } = editerbartElement.find(Nav.Fieldset).props();

      expect((legend as any).props.symbolsynlighet).toEqual(forventetSymbolsynlighet);
    });
  });
});
