import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  Container: ({ children }: any) => <div>{children}</div>,
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  Heading: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock("../../../../kodeverk", () => ({
  Menypunkter: { ArbeidsforholdOgInntekt: { tittel: "Arbeidsforhold og inntekt" } },
}));

vi.mock("./arbeidsgivereNorge", () => ({
  default: () => <div>ArbeidsgivereNorge</div>,
}));

import ArbeidsforholdOgInntekt from "./arbeidsforholdOgInntekt";

describe("ArbeidsforholdOgInntekt", () => {
  it("rendrer tittel og child-komponent", () => {
    render(<ArbeidsforholdOgInntekt />);
    expect(screen.getByText("Arbeidsforhold og inntekt")).toBeDefined();
    expect(screen.getByText("ArbeidsgivereNorge")).toBeDefined();
  });
});
