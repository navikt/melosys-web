import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("./sokkelSkipEnkelt", () => ({
  default: ({ maritimtArbeid }: any) => <div>Enkelt: {maritimtArbeid.enhetNavn}</div>,
}));

import SokkelSkipListe from "./sokkelSkipListe";

const defaultProps = {
  begrunnelser: [],
  redigerbart: true,
  avklartefaktaEndretHandler: vi.fn(),
  avklartefaktaBegrunnelserEndretHandler: vi.fn(),
  oppdaterData: vi.fn(),
  slettData: vi.fn(),
};

describe("SokkelSkipListe", () => {
  it("rendrer ingenting når maritimtArbeid er tom", () => {
    const { container } = render(<SokkelSkipListe {...defaultProps} maritimtArbeid={[]} />);
    expect(container.textContent).toBe("");
  });

  it("rendrer ett element per maritimt arbeid", () => {
    const arbeid = [{ enhetNavn: "Plattform A" }, { enhetNavn: "Skip B" }] as any;
    render(<SokkelSkipListe {...defaultProps} maritimtArbeid={arbeid} />);
    expect(screen.getByText("Enkelt: Plattform A")).toBeDefined();
    expect(screen.getByText("Enkelt: Skip B")).toBeDefined();
  });

  it("matcher avklartfakta basert på subjektID", () => {
    const arbeid = [{ enhetNavn: "Plattform A" }] as any;
    const sokkelListe = [{ subjektID: "Plattform A", verdi: "SOKKEL" }] as any;
    render(<SokkelSkipListe {...defaultProps} maritimtArbeid={arbeid} sokkelEllerSkipListe={sokkelListe} />);
    expect(screen.getByText("Enkelt: Plattform A")).toBeDefined();
  });
});
