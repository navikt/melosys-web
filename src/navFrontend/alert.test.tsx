import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Alert from "./alert";

describe("Alert", () => {
  it("rendrer med variant og tekst", () => {
    render(<Alert variant="info">Info-melding</Alert>);
    expect(screen.getByText("Info-melding")).toBeInTheDocument();
  });

  it("rendrer warning-variant", () => {
    const { container } = render(<Alert variant="warning">Advarsel-tekst</Alert>);
    expect(screen.getByText("Advarsel-tekst")).toBeInTheDocument();
    expect(container.querySelector(".navds-alert--warning")).toBeInTheDocument();
  });
});
