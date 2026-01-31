import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";

vi.mock("../../navFrontend", () => ({
  Select: ({ children, label, error, onChange, ...rest }: any) => (
    <label>
      {label}
      <select onChange={onChange} data-error={error} {...rest}>
        {children}
      </select>
    </label>
  ),
}));

vi.mock("./misc/mapFeilmelding", () => ({
  getErrorMessage: vi.fn(() => undefined),
}));

import Select from "./select";

function TestWrapper({ onChange, emptyFieldDisabled }: any) {
  const methods = useForm({ defaultValues: { testField: "" } });
  return (
    <FormProvider {...methods}>
      <Select
        name="testField"
        control={methods.control}
        label="Velg land"
        onChange={onChange}
        emptyFieldDisabled={emptyFieldDisabled}
      >
        <option value="NO">Norge</option>
        <option value="SE">Sverige</option>
      </Select>
    </FormProvider>
  );
}

describe("Select", () => {
  it("rendrer select med label og tom default-option", () => {
    render(<TestWrapper />);
    expect(screen.getByText("Velg land")).toBeDefined();
    expect(screen.getByText("Velg...")).toBeDefined();
  });

  it("rendrer barn-options", () => {
    render(<TestWrapper />);
    expect(screen.getByText("Norge")).toBeDefined();
    expect(screen.getByText("Sverige")).toBeDefined();
  });

  it("kaller onChange med valgt verdi", () => {
    const onChange = vi.fn();
    render(<TestWrapper onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "NO" } });
    expect(onChange).toHaveBeenCalledWith("NO");
  });
});
