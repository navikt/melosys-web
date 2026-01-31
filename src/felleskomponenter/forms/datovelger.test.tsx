import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";

vi.mock("../../utils/dato", () => ({
  norskStringTilDate: vi.fn((v: string) => v),
}));

vi.mock("../datovelger", () => ({
  default: ({ label, value, readOnly, feil }: any) => (
    <div data-testid="datovelger" data-readonly={readOnly} data-feil={feil}>
      <span>{label}</span>
      <span data-testid="value">{String(value)}</span>
    </div>
  ),
}));

vi.mock("./misc/mapFeilmelding", () => ({
  getErrorMessage: vi.fn(() => undefined),
}));

import Datovelger from "./datovelger";

function TestWrapper({ readOnly, label = "Fom dato" }: any) {
  const methods = useForm({ defaultValues: { testField: "01.01.2024" } });
  return (
    <FormProvider {...methods}>
      <Datovelger name="testField" control={methods.control} label={label} readOnly={readOnly} />
    </FormProvider>
  );
}

describe("Datovelger", () => {
  it("rendrer med label", () => {
    render(<TestWrapper />);
    expect(screen.getByText("Fom dato")).toBeDefined();
  });

  it("sender readOnly videre", () => {
    render(<TestWrapper readOnly />);
    expect(screen.getByTestId("datovelger").getAttribute("data-readonly")).toBe("true");
  });

  it("viser feltverdi", () => {
    render(<TestWrapper />);
    expect(screen.getByTestId("value").textContent).toBe("01.01.2024");
  });
});
