import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Tag from "./tag";

describe("Tag", () => {
  it("rendrer med variant og tekst", () => {
    render(<Tag variant="info">Status</Tag>);
    expect(screen.getByText("Status")).toBeInTheDocument();
  });
});
