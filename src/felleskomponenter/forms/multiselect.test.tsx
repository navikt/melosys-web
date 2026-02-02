import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";

vi.mock("../multiSelect", () => ({
  default: ({ label, redigerbart, values, options, feil }: any) => (
    <div data-testid="multiselect" data-redigerbart={redigerbart} data-feil={feil}>
      <span>{label}</span>
      <span data-testid="values">{JSON.stringify(values)}</span>
      <span data-testid="options">{JSON.stringify(options)}</span>
    </div>
  ),
}));

vi.mock("./misc/mapFeilmelding", () => ({
  getErrorMessage: vi.fn(() => undefined),
}));

import MultiSelect from "./multiselect";

function TestWrapper({ redigerbart = true }: any) {
  const methods = useForm({ defaultValues: { testField: ["NO", "SE"] } });
  return (
    <FormProvider {...methods}>
      <MultiSelect
        name="testField"
        control={methods.control as any}
        label="Velg land"
        redigerbart={redigerbart}
        options={[
          { label: "Norge", value: "NO" },
          { label: "Sverige", value: "SE" },
        ]}
      />
    </FormProvider>
  );
}

describe("MultiSelect", () => {
  it("rendrer med label", () => {
    render(<TestWrapper />);
    expect(screen.getByText("Velg land")).toBeDefined();
  });

  it("sender redigerbart videre", () => {
    render(<TestWrapper redigerbart={false} />);
    expect(screen.getByTestId("multiselect").getAttribute("data-redigerbart")).toBe("false");
  });

  it("viser valgte verdier fra form state", () => {
    render(<TestWrapper />);
    expect(screen.getByTestId("values").textContent).toBe('["NO","SE"]');
  });
});
