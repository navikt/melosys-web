import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../navFrontend", () => ({
  Heading: ({ children }: any) => <h3>{children}</h3>,
}));

import Komponent, { KomponentUtenOverskrift } from "./komponent";

describe("Komponent", () => {
  it("rendrer tittel og innhold", () => {
    const Ikon = ({ className }: any) => <svg className={className} />;
    render(<Komponent ikon={Ikon} tittel="Test tittel" innhold={<span>Innhold her</span>} />);
    expect(screen.getByText("Test tittel")).toBeDefined();
    expect(screen.getByText("Innhold her")).toBeDefined();
  });
});

describe("KomponentUtenOverskrift", () => {
  it("rendrer bare innhold", () => {
    render(<KomponentUtenOverskrift innhold={<span>Bare innhold</span>} />);
    expect(screen.getByText("Bare innhold")).toBeDefined();
  });
});
