import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../../../navFrontend", () => ({
  Column: ({ children }: any) => <div>{children}</div>,
  Checkbox: ({ children, checked, onChange, readOnly }: any) => (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} readOnly={readOnly} />
      {children}
    </label>
  ),
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

import { Betalingsvalg } from "./betalingsvalg";

describe("Betalingsvalg", () => {
  it("rendrer checkbox med tekst", () => {
    render(<Betalingsvalg skalSendeFaktura={false} onBetalingsvalgChange={vi.fn()} redigerbart={true} />);
    expect(screen.getByText("Bruker skal motta faktura i stedet for trekk i pensjon/uføretrygd")).toBeDefined();
  });

  it("kaller onBetalingsvalgChange ved klikk", () => {
    const onChange = vi.fn();
    render(<Betalingsvalg skalSendeFaktura={false} onBetalingsvalgChange={onChange} redigerbart={true} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("viser checked når skalSendeFaktura er true", () => {
    render(<Betalingsvalg skalSendeFaktura={true} onBetalingsvalgChange={vi.fn()} redigerbart={true} />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
  });
});
