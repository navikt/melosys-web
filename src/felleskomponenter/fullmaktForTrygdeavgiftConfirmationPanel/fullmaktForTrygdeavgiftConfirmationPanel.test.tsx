import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../navFrontend", () => ({
  ConfirmationPanel: ({ children, label, checked, onChange }: any) => (
    <div>
      <label>
        <input type="checkbox" checked={checked} onChange={onChange} />
        {label}
      </label>
      {children}
    </div>
  ),
  BodyLong: ({ children }: any) => <span>{children}</span>,
  List: Object.assign(({ children }: any) => <ul>{children}</ul>, { Item: ({ children }: any) => <li>{children}</li> }),
}));

import FullmaktForTrygdeavgiftConfirmationPanel from "./fullmaktForTrygdeavgiftConfirmationPanel";

describe("FullmaktForTrygdeavgiftConfirmationPanel", () => {
  it("viser arbeidsgiver-tekst når ikke pensjonist", () => {
    render(<FullmaktForTrygdeavgiftConfirmationPanel harBekreftet={false} onChange={vi.fn()} erPensjonist={false} />);
    expect(screen.getByText(/arbeidsgiver som skal motta faktura/)).toBeDefined();
  });

  it("viser pensjonist-tekst når erPensjonist er true", () => {
    render(<FullmaktForTrygdeavgiftConfirmationPanel harBekreftet={false} onChange={vi.fn()} erPensjonist={true} />);
    expect(screen.getByText(/Fullmektig for betaling av trygdeavgift er en virksomhet/)).toBeDefined();
  });

  it("kaller onChange med invertert verdi ved klikk", () => {
    const onChange = vi.fn();
    render(<FullmaktForTrygdeavgiftConfirmationPanel harBekreftet={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("viser bekreftelseslabel", () => {
    render(<FullmaktForTrygdeavgiftConfirmationPanel harBekreftet={true} onChange={vi.fn()} />);
    expect(screen.getByText(/Jeg bekrefter at fullmektig for betaling er riktig/)).toBeDefined();
  });
});
