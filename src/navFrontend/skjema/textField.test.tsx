import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TextField from "./textField";

describe("TextField", () => {
  it("rendrer med label", () => {
    render(<TextField label="Navn" />);
    expect(screen.getByLabelText("Navn")).toBeInTheDocument();
  });

  it("har melosys-textfield klasse", () => {
    const { container } = render(<TextField label="Test" />);
    expect(container.querySelector(".melosys-textfield")).toBeInTheDocument();
  });

  it("legger til custom className", () => {
    const { container } = render(<TextField label="Test" className="extra" />);
    expect(container.querySelector(".melosys-textfield.extra")).toBeInTheDocument();
  });
});
