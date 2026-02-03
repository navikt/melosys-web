import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../../kodeverk", () => ({ Form: {} }));

vi.mock("../../../../adresser/strukturertAdresse", () => ({
  default: () => <div>adresse</div>,
}));

import EnkeltArbeidsforholdUtlandRedigeringUtfort from "./enkeltArbeidsforholdUtlandRedigeringUtfort";

describe("EnkeltArbeidsforholdUtlandRedigeringUtfort", () => {
  it("rendrer orgnr når det finnes", () => {
    render(<EnkeltArbeidsforholdUtlandRedigeringUtfort verdier={{ orgnr: "123456789" } as any} />);
    expect(screen.getByText("123456789")).toBeDefined();
    expect(screen.getByText("Registreringsnummer")).toBeDefined();
  });

  it("rendrer ikke orgnr-seksjon når orgnr mangler", () => {
    render(<EnkeltArbeidsforholdUtlandRedigeringUtfort verdier={{} as any} />);
    expect(screen.queryByText("Registreringsnummer")).toBeNull();
  });

  it("rendrer adresse når den finnes", () => {
    render(<EnkeltArbeidsforholdUtlandRedigeringUtfort verdier={{ adresse: { gate: "Test" } } as any} />);
    expect(screen.getByText("adresse")).toBeDefined();
  });
});
