import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CheckboxGroup from "./checkboxGroup";

describe("CheckboxGroup", () => {
  it("rendrer med legend", () => {
    render(
      <CheckboxGroup legend="Velg alternativer">
        <span>innhold</span>
      </CheckboxGroup>,
    );
    expect(screen.getByText("Velg alternativer")).toBeInTheDocument();
  });
});
