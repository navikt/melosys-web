import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Handling from "./handling";

describe("Handling", () => {
  it("rendrer tekst", () => {
    render(<Handling tekst="Klikk meg" onClick={vi.fn()} />);
    expect(screen.getByText("Klikk meg")).toBeInTheDocument();
  });

  it("kaller onClick ved klikk", () => {
    const onClick = vi.fn();
    render(<Handling tekst="Klikk" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("kaller onClick ved Enter-tast", () => {
    const onClick = vi.fn();
    render(<Handling tekst="Klikk" onClick={onClick} />);
    fireEvent.keyPress(screen.getByRole("button"), { key: "Enter", charCode: 13 });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("rendrer som disabled uten role=button", () => {
    render(<Handling tekst="Deaktivert" onClick={vi.fn()} disabled />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Deaktivert")).toBeInTheDocument();
  });

  it("rendrer ikon når oppgitt", () => {
    render(<Handling tekst="Med ikon" onClick={vi.fn()} ikon={<span data-testid="ikon" />} />);
    expect(screen.getByTestId("ikon")).toBeInTheDocument();
  });
});
