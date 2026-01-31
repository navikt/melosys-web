import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ConfirmationPanel from "./confirmationPanel";

describe("ConfirmationPanel", () => {
  it("rendrer med label og innhold", () => {
    render(<ConfirmationPanel label="Bekreft">Innhold</ConfirmationPanel>);
    expect(screen.getByText("Innhold")).toBeInTheDocument();
  });
});
