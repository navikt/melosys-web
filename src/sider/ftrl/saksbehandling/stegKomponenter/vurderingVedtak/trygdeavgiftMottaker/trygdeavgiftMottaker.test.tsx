import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../../navFrontend", () => ({
  Column: ({ children }: any) => <div>{children}</div>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../../../melosyskodeverk", () => ({
  default: { Koder: { betalingstype: { FAKTURA: "FAKTURA" } } },
}));

import { TrygdeavgiftMottaker } from "./trygdeavgiftMottaker";

describe("TrygdeavgiftMottaker", () => {
  it("viser mottaker og faktura-tekst når ikke førstegang", () => {
    render(<TrygdeavgiftMottaker mottaker="NAV" betalingsvalg="FAKTURA" erFørstegang={false} />);
    expect(screen.getByText("NAV ved faktura")).toBeDefined();
  });

  it("viser mottaker og trekk-tekst for annet betalingsvalg", () => {
    render(<TrygdeavgiftMottaker mottaker="NAV" betalingsvalg="TREKK" erFørstegang={false} />);
    expect(screen.getByText("NAV ved trekk i pensjon/uføretrygd")).toBeDefined();
  });

  it("viser kun mottaker når erFørstegang er true", () => {
    render(<TrygdeavgiftMottaker mottaker="NAV" betalingsvalg="FAKTURA" erFørstegang={true} />);
    expect(screen.getByText("NAV")).toBeDefined();
  });
});
