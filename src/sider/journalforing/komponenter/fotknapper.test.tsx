import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../navFrontend", () => ({
  Button: ({ children, onClick, loading, variant, ...rest }: any) => (
    <button onClick={onClick} data-loading={loading} data-variant={variant} {...rest}>
      {children}
    </button>
  ),
}));

import Fotknapper from "./fotknapper";

describe("Fotknapper", () => {
  it("rendrer Journalfør-knapp", () => {
    render(<Fotknapper avbrytJournalforing={vi.fn()} />);
    expect(screen.getByText("Journalfør")).toBeDefined();
  });

  it("rendrer Avbryt-knapp", () => {
    render(<Fotknapper avbrytJournalforing={vi.fn()} />);
    expect(screen.getByText("Avbryt")).toBeDefined();
  });

  it("kaller avbrytJournalforing ved klikk på Avbryt", () => {
    const avbryt = vi.fn();
    render(<Fotknapper avbrytJournalforing={avbryt} />);
    fireEvent.click(screen.getByText("Avbryt"));
    expect(avbryt).toHaveBeenCalled();
  });

  it("viser spinner når spinner er true", () => {
    render(<Fotknapper avbrytJournalforing={vi.fn()} spinner={true} />);
    expect(screen.getByText("Journalfør").getAttribute("data-loading")).toBe("true");
  });
});
