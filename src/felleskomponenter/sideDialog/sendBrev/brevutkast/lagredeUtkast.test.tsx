import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../utils", () => ({
  _isEmpty: (val: any) => !val || val.length === 0,
}));

vi.mock("../../../../resources/images", () => ({
  Draft: () => <span>ikon</span>,
}));

vi.mock("../../../ui", () => ({
  Lenkeknapp: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

import LagredeUtkast from "./lagredeUtkast";

describe("LagredeUtkast", () => {
  it("rendrer ingenting når alleUtkast er tom", () => {
    const { container } = render(<LagredeUtkast alleUtkast={[]} settAktivtUtkast={vi.fn()} />);
    expect(container.querySelector(".lagredeUtkast")).toBeNull();
  });

  it("rendrer utkast-titler og eier", () => {
    const utkast = [{ tittel: "Utkast 1", lagretAvSaksbehandlerIdent: "Z999999" }] as any;
    render(<LagredeUtkast alleUtkast={utkast} settAktivtUtkast={vi.fn()} />);
    expect(screen.getByText("Lagrede utkast")).toBeDefined();
    expect(screen.getByText("Utkast 1")).toBeDefined();
    expect(screen.getByText("Z999999")).toBeDefined();
  });

  it("kaller settAktivtUtkast med riktig utkast ved klikk", () => {
    const settAktivt = vi.fn();
    const utkast = [
      { tittel: "Utkast A", lagretAvSaksbehandlerIdent: "Z111" },
      { tittel: "Utkast B", lagretAvSaksbehandlerIdent: "Z222" },
    ] as any;
    render(<LagredeUtkast alleUtkast={utkast} settAktivtUtkast={settAktivt} />);
    fireEvent.click(screen.getByText("Utkast B"));
    expect(settAktivt).toHaveBeenCalledWith(utkast[1]);
  });
});
