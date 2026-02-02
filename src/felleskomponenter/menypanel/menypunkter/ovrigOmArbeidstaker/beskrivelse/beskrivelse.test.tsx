import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

import Beskrivelse from "./beskrivelse";

describe("Beskrivelse", () => {
  it("rendrer label og tekst", () => {
    render(<Beskrivelse label="Stillingsprosent" tekst="100%" />);
    expect(screen.getByText("Stillingsprosent")).toBeDefined();
    expect(screen.getByText("100%")).toBeDefined();
  });

  it("viser bindestrek når tekst er null", () => {
    render(<Beskrivelse label="Stillingsprosent" tekst={null} />);
    expect(screen.getByText("-")).toBeDefined();
  });

  it("viser bindestrek når tekst er undefined", () => {
    render(<Beskrivelse label="Stillingsprosent" />);
    expect(screen.getByText("-")).toBeDefined();
  });
});
