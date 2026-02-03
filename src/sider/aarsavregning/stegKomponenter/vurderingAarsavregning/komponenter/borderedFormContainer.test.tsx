import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { BorderedFormContainer } from "./borderedFormContainer";

describe("BorderedFormContainer", () => {
  it("rendrer children", () => {
    render(
      <BorderedFormContainer>
        <span>Innhold</span>
      </BorderedFormContainer>,
    );
    expect(screen.getByText("Innhold")).toBeDefined();
  });

  it("har bordered-form-container klasse", () => {
    const { container } = render(<BorderedFormContainer>Test</BorderedFormContainer>);
    expect(container.querySelector(".bordered-form-container")).not.toBeNull();
  });

  it("legger til ekstra className", () => {
    const { container } = render(<BorderedFormContainer className="extra">Test</BorderedFormContainer>);
    expect(container.querySelector(".bordered-form-container.extra")).not.toBeNull();
  });
});
