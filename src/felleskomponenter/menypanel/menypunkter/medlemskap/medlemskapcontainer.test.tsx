import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  Container: ({ children }: any) => <div>{children}</div>,
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  Heading: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock("../../../../kodeverk", () => ({
  Menypunkter: { Medlemskap: { tittel: "Medlemskap" } },
}));

vi.mock("./medlemskap", () => ({
  default: () => <div>MedlemskapInnhold</div>,
}));

import MedlemskapContainer from "./medlemskapcontainer";

describe("MedlemskapContainer", () => {
  it("rendrer tittel fra kodeverk", () => {
    render(<MedlemskapContainer />);
    expect(screen.getByText("Medlemskap")).toBeDefined();
  });

  it("rendrer Medlemskap-komponent", () => {
    render(<MedlemskapContainer />);
    expect(screen.getByText("MedlemskapInnhold")).toBeDefined();
  });
});
