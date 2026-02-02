import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";

vi.mock("../../navFrontend", () => ({
  Checkbox: ({ children, onChange, checked, readOnly, error, ...rest }: any) => (
    <label>
      <input type="checkbox" onChange={onChange} checked={checked} readOnly={readOnly} data-error={error} {...rest} />
      {children}
    </label>
  ),
}));

vi.mock("./misc/mapFeilmelding", () => ({
  getErrorMessage: vi.fn(() => undefined),
}));

vi.mock("../../utils", () => ({
  _uuid: () => "test-uuid",
}));

import Checkbox from "./checkbox";

function TestWrapper({ onChange, checked, label = "Test checkbox" }: any) {
  const methods = useForm({ defaultValues: { testField: false } });
  return (
    <FormProvider {...methods}>
      <Checkbox name="testField" control={methods.control as any} label={label} onChange={onChange} checked={checked} />
    </FormProvider>
  );
}

describe("Checkbox", () => {
  it("rendrer checkbox med label", () => {
    render(<TestWrapper />);
    expect(screen.getByText("Test checkbox")).toBeDefined();
  });

  it("rendrer med checked fra prop", () => {
    render(<TestWrapper checked={true} />);
    const cb = screen.getByRole("checkbox") as HTMLInputElement;
    expect(cb.checked).toBe(true);
  });

  it("kaller onChange ved klikk", () => {
    const onChange = vi.fn();
    render(<TestWrapper onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalled();
  });
});
