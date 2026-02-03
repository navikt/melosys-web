import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../navFrontend", () => ({
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../felleskomponenter/ui", () => ({
  Undertittel: ({ tekst }: any) => <h2>{tekst}</h2>,
}));

vi.mock("../../../resources/images", () => ({
  AccountCircle: () => <span>ikon</span>,
}));

vi.mock("../../../utils", () => ({
  _isEmpty: (val: any) => !val || val.length === 0,
}));

vi.mock("../../../felleskomponenter/skjema", () => ({
  FellesInputFnrDnrOrgnrSaksnr: ({ label }: any) => <input aria-label={label} />,
}));

import IdentOgNavn from "./identOgNavn";

describe("IdentOgNavn", () => {
  it("rendrer tittel og label", () => {
    render(<IdentOgNavn tittel="Arbeidstaker" feltNavn="fnr" label="Fødselsnummer" navn="" />);
    expect(screen.getByText("Arbeidstaker")).toBeDefined();
    expect(screen.getByLabelText("Fødselsnummer")).toBeDefined();
  });

  it("viser navn når det finnes", () => {
    render(<IdentOgNavn tittel="Arbeidstaker" feltNavn="fnr" label="Fødselsnummer" navn="Ola Nordmann" />);
    expect(screen.getByText("Navn:")).toBeDefined();
    expect(screen.getByText("Ola Nordmann")).toBeDefined();
  });

  it("viser ikke navn-seksjon når navn er tomt", () => {
    render(<IdentOgNavn tittel="Arbeidstaker" feltNavn="fnr" label="Fødselsnummer" navn="" />);
    expect(screen.queryByText("Navn:")).toBeNull();
  });
});
