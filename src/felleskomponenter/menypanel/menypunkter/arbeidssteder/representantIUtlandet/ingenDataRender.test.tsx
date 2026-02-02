import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../ui", () => ({
  Lenkeknapp: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock("../../../../../resources/images", () => ({
  Add: () => <span>+</span>,
}));

import IngenDataRender from "./ingenDataRender";

describe("IngenDataRender", () => {
  it("rendrer lenkeknapp når redigerbart er true", () => {
    render(<IngenDataRender redigerbart={true} onClick={vi.fn()} lenketekst="Legg til" />);
    expect(screen.getByText("Legg til")).toBeDefined();
  });

  it("rendrer ingenting når redigerbart er false", () => {
    const { container } = render(<IngenDataRender redigerbart={false} onClick={vi.fn()} lenketekst="Legg til" />);
    expect(container.innerHTML).toBe("");
  });
});
