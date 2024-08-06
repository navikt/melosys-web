import Checkbox from "./index";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect } from "vitest";

describe("Checkbox", () => {
  const props = {
    label: "Heihei",
    value: "Hallo",
    onCheck: vi.fn(),
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
});
