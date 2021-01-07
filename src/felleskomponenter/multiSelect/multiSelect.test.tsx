import React from "react";
import { shallow } from "enzyme";
import Select from "react-select";

import MultiSelect from "./multiSelect";

const props = {
  label: "Label",
  values: [],
  onChange: () => {},
  options: [
    { value: "SE", label: "Sverige" },
    { value: "DK", label: "Danmark" },
    { value: "FI", label: "Finland" },
  ],
};

describe("MultiSelect", () => {
  it("Props blir satt", () => {
    const multiSelect = shallow(<MultiSelect {...props} />);

    const select = multiSelect.find(Select);
    expect(select).toBeDefined();
    expect(select.props().options).toMatchObject(props.options);
  });

  it("Value blir satt", () => {
    const multiSelect = shallow(<MultiSelect {...props} values={["DK"]} />);

    const select = multiSelect.find(Select);
    expect(select).toBeDefined();
    expect(select.props().value).toMatchObject([{ value: "DK", label: "Danmark" }]);
  });

  it("Label vises", () => {
    const multiSelect = shallow(<MultiSelect {...props} />);

    const label = multiSelect.find("label");
    expect(label).toBeDefined();
    expect(label.render().html()).toEqual(props.label);
  });

  it("Feilmelding vises", () => {
    const feilmelding = "Feil!";
    const multiSelect = shallow(<MultiSelect {...props} feil={{ feilmelding }} />);

    const feilContainer = multiSelect.find(".skjemaelement__feilmelding");
    expect(feilContainer).toBeDefined();
    expect(feilContainer.render().html()).toEqual(feilmelding);
  });
});
