import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../ui", () => ({
  IkonKnapp: ({ ariaLabel, onClick }: any) => (
    <button aria-label={ariaLabel} onClick={onClick}>
      {ariaLabel}
    </button>
  ),
}));

vi.mock("../../../../../resources/images", () => ({
  Bin: () => <span>bin</span>,
}));

import Sletterad from "./sletterad";

describe("Sletterad", () => {
  it("rendrer slett-knapp", () => {
    render(<Sletterad onClick={vi.fn()} />);
    expect(screen.getByLabelText("Slett arbeidssted")).toBeDefined();
  });

  it("kaller onClick ved klikk", () => {
    const onClick = vi.fn();
    render(<Sletterad onClick={onClick} />);
    screen.getByLabelText("Slett arbeidssted").click();
    expect(onClick).toHaveBeenCalled();
  });
});
