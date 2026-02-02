import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import IngenData from "./ingenData";

describe("IngenData (medfolgendeFamilie)", () => {
  it("rendrer tekst om ingen barn oppgitt", () => {
    render(<IngenData />);
    expect(screen.getByText(/Ingen barn oppgitt/)).toBeInTheDocument();
  });
});
