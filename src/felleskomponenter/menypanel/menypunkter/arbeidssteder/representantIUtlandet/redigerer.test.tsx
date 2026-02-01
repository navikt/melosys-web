import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../../../skjema", () => ({
  Input: ({ label }: any) => <div>{label}</div>,
  LandVelger: ({ label }: any) => <div>{label}</div>,
}));

vi.mock("./adresselinjer", () => ({
  default: () => <div>Adresselinjer</div>,
}));

import Redigerer from "./redigerer";

describe("Redigerer (representantIUtlandet)", () => {
  it("rendrer navn-input, adresselinjer og landvelger", () => {
    render(<Redigerer redigerbart={true} />);
    expect(screen.getByText("Navn på arbeidssted/skip/innretning")).toBeDefined();
    expect(screen.getByText("Adresselinjer")).toBeDefined();
    expect(screen.getByText("Land")).toBeDefined();
  });
});
