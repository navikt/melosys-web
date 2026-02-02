import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RadioGroup from "./radiogroup";

describe("RadioGroup", () => {
  it("rendrer med legend", () => {
    render(
      <RadioGroup legend="Velg ett alternativ">
        <span>innhold</span>
      </RadioGroup>,
    );
    expect(screen.getByText("Velg ett alternativ")).toBeInTheDocument();
  });
});
