import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm, FormProvider, FieldValues } from "react-hook-form";

vi.mock("../../navFrontend", () => ({
  RadioGroup: ({ children, legend, className }: any) => (
    <fieldset className={className}>
      <legend>{legend}</legend>
      <div>{children}</div>
    </fieldset>
  ),
}));

vi.mock("./misc/mapFeilmelding", () => ({
  getErrorMessage: vi.fn(() => undefined),
}));

import RadioGroup from "./radiogroup";

function TestWrapper() {
  const methods = useForm<FieldValues>({ defaultValues: { testField: "" } });
  return (
    <FormProvider {...methods}>
      <RadioGroup name="testField" control={methods.control} legend="Velg svar">
        <span>Ja</span>
        <span>Nei</span>
      </RadioGroup>
    </FormProvider>
  );
}

describe("RadioGroup", () => {
  it("rendrer med legend", () => {
    render(<TestWrapper />);
    expect(screen.getByText("Velg svar")).toBeDefined();
  });

  it("rendrer barn", () => {
    render(<TestWrapper />);
    expect(screen.getByText("Ja")).toBeDefined();
    expect(screen.getByText("Nei")).toBeDefined();
  });

  it("har melosys-radiogroup klasse", () => {
    const { container } = render(<TestWrapper />);
    expect(container.querySelector(".melosys-radiogroup")).toBeDefined();
  });
});
