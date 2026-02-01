import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../utils", () => ({
  dato: {
    dateTilIsoString: (d: Date) => d.toISOString().slice(0, 10),
  },
}));

vi.mock("./jul/ChristmasReindeer", () => ({
  ChristmasDeer: () => <span>Reinsdyr</span>,
}));

vi.mock("./jul/ChristmasSantaAndDeer", () => ({
  ChristmasSantaAndDeer: () => <span>Nisse</span>,
}));

vi.mock("./jul/MistelteinSvg", () => ({
  MistelteinSvg: () => <span>Misteltein</span>,
}));

import { HolidayDecor } from "./holidayDecor";

describe("HolidayDecor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rendrer juledekor i desember", () => {
    vi.setSystemTime(new Date(2024, 11, 15));
    render(<HolidayDecor slot="brand" />);
    expect(screen.getByText("Reinsdyr")).toBeDefined();
  });

  it("rendrer riktig slot", () => {
    vi.setSystemTime(new Date(2024, 11, 20));
    render(<HolidayDecor slot="center" />);
    expect(screen.getByText("Nisse")).toBeDefined();
  });

  it("rendrer ingenting utenfor juleperioden", () => {
    vi.setSystemTime(new Date(2024, 5, 15));
    const { container } = render(<HolidayDecor slot="brand" />);
    expect(container.innerHTML).toBe("");
  });
});
