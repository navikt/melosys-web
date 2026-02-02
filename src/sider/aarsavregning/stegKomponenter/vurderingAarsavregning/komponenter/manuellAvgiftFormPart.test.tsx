import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../../felleskomponenter/forms", () => ({
  Input: ({ label, description, readOnly, onChange }: any) => (
    <div>
      <label>{label}</label>
      {description && <span>{description}</span>}
      <input readOnly={readOnly} onChange={(e: any) => onChange?.(e.target.value)} />
    </div>
  ),
}));

import { ManuellAvgiftFormPart } from "./manuellAvgiftFormPart";

describe("ManuellAvgiftFormPart", () => {
  it("rendrer label", () => {
    render(
      <ManuellAvgiftFormPart
        control={{} as any}
        redigerbart={true}
        debouncedOppdaterManueltAvgiftBeloep={vi.fn()}
        tidligereAarsavregningErManueltBeregnet={false}
      />,
    );
    expect(screen.getByText("Endelig beregnet trygdeavgift")).toBeDefined();
  });

  it("viser beskrivelse når tidligere er manuelt beregnet", () => {
    render(
      <ManuellAvgiftFormPart
        control={{} as any}
        redigerbart={true}
        debouncedOppdaterManueltAvgiftBeloep={vi.fn()}
        tidligereAarsavregningErManueltBeregnet={true}
      />,
    );
    expect(screen.getByText("Du skal kun endre hvis tidligere oppgitte beløp er feil")).toBeDefined();
  });

  it("kaller onChange-callback ved endring", () => {
    const onChange = vi.fn();
    render(
      <ManuellAvgiftFormPart
        control={{} as any}
        redigerbart={true}
        debouncedOppdaterManueltAvgiftBeloep={onChange}
        tidligereAarsavregningErManueltBeregnet={false}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "5000" } });
    expect(onChange).toHaveBeenCalledWith("5000");
  });
});
