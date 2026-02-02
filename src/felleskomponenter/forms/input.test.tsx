import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";

vi.mock("../../navFrontend", () => ({
  TextField: ({ error, ...rest }: any) => <input data-error={error} {...rest} />,
}));

vi.mock("./misc/mapFeilmelding", () => ({
  getErrorMessage: vi.fn(() => undefined),
}));

import Input from "./input";

function TestWrapper({ numeric, tillattNegativeTall, onChange }: any) {
  const methods = useForm({ defaultValues: { testField: "" } });
  return (
    <FormProvider {...methods}>
      <Input
        name="testField"
        control={methods.control as any}
        label="Test"
        numeric={numeric}
        tillattNegativeTall={tillattNegativeTall}
        onChange={onChange}
      />
    </FormProvider>
  );
}

describe("Input", () => {
  it("rendrer input-felt", () => {
    render(<TestWrapper />);
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  it("filtrerer ikke-numeriske tegn når numeric er true", () => {
    render(<TestWrapper numeric />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc123def" } });
    expect(input.value).toBe("123");
  });

  it("tillater negativt tall når tillattNegativeTall er true", () => {
    render(<TestWrapper numeric tillattNegativeTall />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "-42" } });
    expect(input.value).toBe("-42");
  });

  it("fjerner ekstra minustegn", () => {
    render(<TestWrapper numeric tillattNegativeTall />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "-1-2-3" } });
    expect(input.value).toBe("-123");
  });

  it("fjerner minustegn midt i tallet når tillattNegativeTall er false", () => {
    render(<TestWrapper numeric />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "-123" } });
    expect(input.value).toBe("123");
  });

  it("kaller onChange callback ved endring", () => {
    const onChange = vi.fn();
    render(<TestWrapper onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalledWith("hello");
  });
});
