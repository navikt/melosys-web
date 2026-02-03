import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../../kodeverk", () => ({
  kodeTilTerm: (kode: string) => kode,
}));

vi.mock("../../../../../melosyskodeverk", () => ({
  default: { KTObjects: { land_iso2: [] } },
}));

vi.mock("../../../../../utils", () => ({
  _uuid: () => "mock-uuid",
}));

import RedigeringUtfort from "./redigeringUtfort";

describe("representantIUtlandet RedigeringUtfort", () => {
  it("rendrer adresselinjer", () => {
    render(<RedigeringUtfort adresselinjer={["Testveien 1", "0123 Oslo"]} soknadsland={["NO"]} />);
    expect(screen.getByText("Testveien 1")).toBeDefined();
    expect(screen.getByText("0123 Oslo")).toBeDefined();
  });

  it("rendrer søknadsland", () => {
    render(<RedigeringUtfort adresselinjer={[]} soknadsland={["SE"]} />);
    expect(screen.getByText("SE")).toBeDefined();
  });
});
