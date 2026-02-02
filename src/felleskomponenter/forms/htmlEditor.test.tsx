import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";

vi.mock("../htmlEditor", () => ({
  default: ({ className, disabled, feil }: any) => (
    <div data-testid="html-editor" data-classname={className} data-disabled={disabled} data-feil={feil}>
      editor
    </div>
  ),
}));

vi.mock("./misc/mapFeilmelding", () => ({
  getErrorMessage: vi.fn(() => undefined),
}));

import HTMLEditor from "./htmlEditor";

function TestWrapper({ disabled, className }: any) {
  const methods = useForm({ defaultValues: { testField: "" } });
  return (
    <FormProvider {...methods}>
      <HTMLEditor name="testField" control={methods.control as any} disabled={disabled} className={className} />
    </FormProvider>
  );
}

describe("HTMLEditor (form)", () => {
  it("rendrer html-editor", () => {
    render(<TestWrapper />);
    expect(screen.getByTestId("html-editor")).toBeDefined();
  });

  it("sender disabled videre", () => {
    render(<TestWrapper disabled />);
    expect(screen.getByTestId("html-editor").getAttribute("data-disabled")).toBe("true");
  });

  it("sender className videre", () => {
    render(<TestWrapper className="custom-class" />);
    expect(screen.getByTestId("html-editor").getAttribute("data-classname")).toBe("custom-class");
  });
});
