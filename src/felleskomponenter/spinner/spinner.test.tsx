import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("rendrer uten feil", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeTruthy();
  });
});
