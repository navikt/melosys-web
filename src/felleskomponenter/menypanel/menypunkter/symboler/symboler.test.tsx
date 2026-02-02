import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../ui", () => ({
  IkonKnapp: ({ ariaLabel, onClick }: any) => (
    <button aria-label={ariaLabel} onClick={onClick}>
      {ariaLabel}
    </button>
  ),
}));

vi.mock("../../../../resources/images", () => ({
  Pencil: () => <span>pencil</span>,
  Bin: () => <span>bin</span>,
}));

import { Rediger, Slett } from "./symboler";

describe("Symboler", () => {
  it("Rediger har aria-label Rediger", () => {
    render(<Rediger onClick={vi.fn()} />);
    expect(screen.getByLabelText("Rediger")).toBeDefined();
  });

  it("Slett har aria-label Slett", () => {
    render(<Slett onClick={vi.fn()} />);
    expect(screen.getByLabelText("Slett")).toBeDefined();
  });

  it("Slett kaller onClick ved klikk", () => {
    const onClick = vi.fn();
    render(<Slett onClick={onClick} />);
    screen.getByLabelText("Slett").click();
    expect(onClick).toHaveBeenCalled();
  });
});
