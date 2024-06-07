import { render, fireEvent } from "@testing-library/react";
import AarVelger from "./AarVelger";

describe("AarVelger", () => {
  it("displays the correct years", () => {
    const { getByTestId } = render(<AarVelger onForandringAvAar={() => {}} />);
    const select = getByTestId("aarVelger") as HTMLSelectElement;
    const options = Array.from(select.options);
    const optionValues = options.map((option) => option.value);
    const currentYear = new Date().getFullYear();
    const expectedYears = Array.from({ length: 7 }, (_, index) => String(currentYear - index - 1));
    expect(optionValues).toEqual(expectedYears);
  });

  it("kaller onYearChange når vi forandrer år", () => {
    const onYearChange = vi.fn();
    const { getByTestId } = render(<AarVelger onForandringAvAar={onYearChange} />);
    const select = getByTestId("aarVelger");
    fireEvent.change(select, { target: { value: "2020" } });
    expect(onYearChange).toHaveBeenCalledWith(2020);
  });
});
