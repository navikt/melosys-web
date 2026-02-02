import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../../kodeverk", () => ({ Form: {} }));

vi.mock("../../../../adresser", () => ({
  StrukturertAdresse: ({ adresse }: any) => <div>adresse-{adresse?.gate}</div>,
}));

import RedigeringUtfort from "./redigeringUtfort";

describe("land RedigeringUtfort", () => {
  it("rendrer virksomhetsnavn", () => {
    const verdier = [{ virksomhetNavn: "NAV AS", adresse: { gate: "Testveien 1" } }] as any;
    render(<RedigeringUtfort verdier={verdier} />);
    expect(screen.getByText("NAV AS")).toBeDefined();
  });

  it("rendrer label 'Navn på virksomhet'", () => {
    render(<RedigeringUtfort verdier={[{ virksomhetNavn: "Test", adresse: {} }] as any} />);
    expect(screen.getByText("Navn på virksomhet")).toBeDefined();
  });

  it("rendrer adresse-komponent", () => {
    const verdier = [{ virksomhetNavn: "Test", adresse: { gate: "Gata 5" } }] as any;
    render(<RedigeringUtfort verdier={verdier} />);
    expect(screen.getByText("adresse-Gata 5")).toBeDefined();
  });
});
