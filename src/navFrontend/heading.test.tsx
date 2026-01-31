import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "./heading";

describe("Heading", () => {
  it("rendrer med tekst", () => {
    render(<Heading>Tittel</Heading>);
    expect(screen.getByText("Tittel")).toBeInTheDocument();
  });

  it("rendrer som h2 med level 2", () => {
    render(<Heading level="2">Undertittel</Heading>);
    const heading = screen.getByText("Undertittel");
    expect(heading.tagName).toBe("H2");
  });

  it("rendrer som h3 med level 3", () => {
    render(<Heading level="3">Liten tittel</Heading>);
    const heading = screen.getByText("Liten tittel");
    expect(heading.tagName).toBe("H3");
  });
});
