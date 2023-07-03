import { ComponentProps } from "react";
import { shallow } from "enzyme";
import { mock, instance } from "ts-mockito";

import * as Mui from "../../../../../felleskomponenter/ui";

import LandLinje from "./landlinje";

describe("LandLinje", () => {
  const mockedProps = mock<ComponentProps<typeof LandLinje>>();
  const props = instance(mockedProps);

  props.land = "DK";
  props.checkbox = {
    checked: true,
    onCheck: jest.fn(),
    redigerbart: true,
    value: "Testvalue",
  };

  const landLinje = shallow(<LandLinje {...props} />);

  it("viser land", () => {
    expect(landLinje.contains("DK")).toBe(true);
  });

  it("viser checkbox", () => {
    const checkbox = landLinje.find(Mui.Checkbox);

    expect(checkbox).toHaveLength(1);

    const checkboxProps = checkbox.props();

    expect(checkboxProps.checked).toBe(props.checkbox.checked);
    expect(checkboxProps.onCheck).toBe(props.checkbox.onCheck);
    expect(checkboxProps.disabled).toBe(!props.checkbox.redigerbart);
    expect(checkboxProps.value).toBe(props.checkbox.value);
  });
});
