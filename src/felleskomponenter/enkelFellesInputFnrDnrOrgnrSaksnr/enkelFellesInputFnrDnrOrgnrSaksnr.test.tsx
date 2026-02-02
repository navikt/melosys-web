import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../navFrontend", () => ({
  TextField: ({ label, value, error, onChange, onBlur }: any) => (
    <label>
      {label}
      <input value={value} onChange={onChange} onBlur={onBlur} />
      {error && <span>{error}</span>}
    </label>
  ),
}));

vi.mock("../../utils", () => ({
  _uuid: () => "test-id",
}));

import EnkelFellesInputFnrDnrOrgnrSaksnr from "./enkelFellesInputFnrDnrOrgnrSaksnr";

describe("EnkelFellesInputFnrDnrOrgnrSaksnr", () => {
  it("rendrer label", () => {
    render(<EnkelFellesInputFnrDnrOrgnrSaksnr label="Fødselsnummer" />);
    expect(screen.getByText("Fødselsnummer")).toBeDefined();
  });

  it("trimmer mellomrom og konverterer til uppercase ved change", () => {
    const onChange = vi.fn();
    render(<EnkelFellesInputFnrDnrOrgnrSaksnr label="Test" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc 123" } });
    expect(onChange).toHaveBeenCalledWith("ABC123");
  });

  it("kaller onBlur med trimmet verdi", () => {
    const onBlur = vi.fn();
    render(<EnkelFellesInputFnrDnrOrgnrSaksnr label="Test" onBlur={onBlur} />);
    fireEvent.blur(screen.getByRole("textbox"), { target: { value: "test verdi" } });
    expect(onBlur).toHaveBeenCalledWith("TESTVERDI");
  });

  it("viser feilmelding", () => {
    render(<EnkelFellesInputFnrDnrOrgnrSaksnr label="Test" error="Ugyldig" />);
    expect(screen.getByText("Ugyldig")).toBeDefined();
  });

  it("bruker initial value", () => {
    render(<EnkelFellesInputFnrDnrOrgnrSaksnr label="Test" value="12345" />);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("12345");
  });
});
