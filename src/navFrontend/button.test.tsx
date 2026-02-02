import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "./button";

describe("Button", () => {
  it("rendrer med tekst", () => {
    render(<Button>Klikk</Button>);
    expect(screen.getByText("Klikk")).toBeInTheDocument();
  });

  it("rendrer med custom size", () => {
    render(<Button size="medium">Stor</Button>);
    expect(screen.getByText("Stor")).toBeInTheDocument();
  });
});
