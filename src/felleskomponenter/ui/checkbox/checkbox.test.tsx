import Checkbox from "./index";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect } from "vitest";

vi.mock("../../../utils", async () => {
  const actual = (await vi.importActual("../../../utils")) as object;
  return {
    ...actual,
    _uuid: () => "321",
  };
});

describe("Checkbox", () => {
  const props = {
    label: "Heihei",
    value: "Hallo",
  };

  it("snapshot test unchecked", () => {
    const { container } = render(<Checkbox {...props} />);
    expect(container).toMatchSnapshot();
  });

  it("snapshot test checked", () => {
    const { container } = render(<Checkbox {...props} />);

    const checkbox = screen.getByRole("checkbox") as any;
    expect(checkbox.checked).toEqual(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toEqual(true);

    expect(container).toMatchSnapshot();
  });

  it("gjør checkbox unchecked ved trykk på enter-tast", () => {
    let checked = true;
    render(<Checkbox {...props} checked={checked} onCheck={(properties) => (checked = properties.checked)} />);

    const checkbox = screen.getByRole("checkbox") as any;
    expect(checkbox.checked).toEqual(true);
    expect(checked).toEqual(true);

    fireEvent.keyPress(checkbox, { key: "Enter", code: "Enter", charCode: 13 });
    expect(checked).toEqual(false);
  });
});
