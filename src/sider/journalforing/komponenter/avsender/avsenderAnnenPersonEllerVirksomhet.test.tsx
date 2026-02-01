import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-redux", () => ({
  connect: () => (comp: any) => comp,
}));

vi.mock("redux-form", () => ({
  formValueSelector: () => () => "",
}));

vi.mock("../../../../kodeverk", () => ({
  Form: { JOURNALFORING: "journalforing" },
}));

vi.mock("../../../../felleskomponenter/skjema", () => ({
  FellesInputFnrDnrOrgnrSaksnr: ({ label, feltNavn }: any) => <input aria-label={label} data-name={feltNavn} />,
}));

vi.mock("../../../../navFrontend", () => ({
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../utils", () => ({
  organisasjon: { erOrgnrGyldig: () => false },
  person: { erGyldigFnrEllerDnr: () => false },
}));

import AvsenderAnnenPersonEllerVirksomhet from "./avsenderAnnenPersonEllerVirksomhet";

describe("AvsenderAnnenPersonEllerVirksomhet", () => {
  it("rendrer input-felt med riktig label", () => {
    render(<AvsenderAnnenPersonEllerVirksomhet hentOgVisAvsender={vi.fn()} avsenderNavn="" />);
    expect(screen.getByLabelText("F.nr./d-nr. eller org.nr.")).toBeDefined();
  });

  it("rendrer Navn-label", () => {
    render(<AvsenderAnnenPersonEllerVirksomhet hentOgVisAvsender={vi.fn()} avsenderNavn="" />);
    expect(screen.getByText(/Navn:/)).toBeDefined();
  });

  it("viser avsenderNavn når satt", () => {
    render(<AvsenderAnnenPersonEllerVirksomhet hentOgVisAvsender={vi.fn()} avsenderNavn="Test Firma AS" />);
    expect(screen.getByText("Test Firma AS")).toBeDefined();
  });
});
