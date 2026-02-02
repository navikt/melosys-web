import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Loader from "./loader";

describe("Loader", () => {
  it("rendrer uten feil", () => {
    const { container } = render(<Loader />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("rendrer med custom size", () => {
    const { container } = render(<Loader size="small" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
