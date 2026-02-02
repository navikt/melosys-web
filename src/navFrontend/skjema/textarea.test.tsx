import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Textarea from "./textarea";

describe("Textarea", () => {
  it("rendrer med label", () => {
    render(<Textarea label="Kommentar" />);
    expect(screen.getByLabelText("Kommentar")).toBeInTheDocument();
  });

  it("har melosys-textarea klasse", () => {
    const { container } = render(<Textarea label="Test" />);
    expect(container.querySelector(".melosys-textarea")).toBeInTheDocument();
  });
});
