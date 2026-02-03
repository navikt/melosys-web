import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { GyldighetshistorikkInfo } from "./gyldighetshistorikkInfo";

describe("GyldighetshistorikkInfo", () => {
  it("rendrer informasjonstekst om gyldighetshistorikk", () => {
    render(<GyldighetshistorikkInfo />);
    expect(screen.getByText(/Gyldighetshistorikk fra Folkeregisteret kan være unøyaktig/)).toBeDefined();
  });

  it("rendrer hjelpetekst", () => {
    render(<GyldighetshistorikkInfo />);
    expect(screen.getByText(/Vær derfor varsom/)).toBeDefined();
  });
});
