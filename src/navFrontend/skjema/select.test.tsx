import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Select from "./select";

describe("Select", () => {
  it("rendrer med label og options", () => {
    render(
      <Select label="Velg land">
        <option value="NO">Norge</option>
        <option value="SE">Sverige</option>
      </Select>,
    );
    expect(screen.getByLabelText("Velg land")).toBeInTheDocument();
    expect(screen.getByText("Norge")).toBeInTheDocument();
  });
});
