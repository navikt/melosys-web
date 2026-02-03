import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  Select: ({ children, label, onChange, value }: any) => (
    <label>
      {label}
      <select onChange={onChange} value={value}>
        {children}
      </select>
    </label>
  ),
}));

vi.mock("../../../../../../kodeverk", () => ({
  kodeTilTerm: (kode: string) => (kode === "REL_1" ? "Relasjon 1" : kode),
}));

import { ListeVelger } from "./listeVelger";

describe("ListeVelger", () => {
  it("rendrer select med alternativer", () => {
    render(
      <ListeVelger
        muligeAlternativer={["REL_1"]}
        kodeverkKoder={[]}
        valgtAlternativ=""
        redigerbart={true}
        name="relasjon"
        tittel="Velg relasjon"
        endretAlternativ={vi.fn()}
      />,
    );
    expect(screen.getByText("Velg relasjon")).toBeDefined();
    expect(screen.getByText("Relasjon 1")).toBeDefined();
  });

  it("returnerer null når muligeAlternativer er tom", () => {
    const { container } = render(
      <ListeVelger
        muligeAlternativer={[]}
        kodeverkKoder={[]}
        valgtAlternativ=""
        redigerbart={true}
        name="test"
        tittel="Test"
        endretAlternativ={vi.fn()}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("kaller endretAlternativ ved endring", () => {
    const onChange = vi.fn();
    render(
      <ListeVelger
        muligeAlternativer={["REL_1"]}
        kodeverkKoder={[]}
        valgtAlternativ=""
        redigerbart={true}
        name="relasjon"
        tittel="Velg"
        endretAlternativ={onChange}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "REL_1" } });
    expect(onChange).toHaveBeenCalledWith("REL_1");
  });
});
