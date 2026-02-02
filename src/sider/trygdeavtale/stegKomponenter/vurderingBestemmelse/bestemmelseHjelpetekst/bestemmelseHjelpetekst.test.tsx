import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../../../melosyskodeverk";
import BestemmelseHjelpetekst from "./bestemmelseHjelpetekst";

describe("BestemmelseHjelpetekst", () => {
  it("returnerer null når bestemmelse er undefined", () => {
    const { container } = render(<BestemmelseHjelpetekst />);
    expect(container.innerHTML).toBe("");
  });

  it("returnerer null for ukjent bestemmelse", () => {
    const { container } = render(<BestemmelseHjelpetekst bestemmelse="UKJENT_KODE" />);
    expect(container.innerHTML).toBe("");
  });

  it("viser hjelpetekster for UK Art 6.1", () => {
    const kode = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_gb.UK_ART6_1;
    render(<BestemmelseHjelpetekst bestemmelse={kode} />);
    expect(screen.getByText("Følgende vilkår må være oppfylt")).toBeDefined();
    expect(screen.getByText(/medlem i folketrygden/)).toBeDefined();
    expect(screen.queryByText(/ikke krav om at utsendingsperioden/)).toBeNull();
  });

  it("viser tidsbegrensning-unntak for UK Art 6.5", () => {
    const kode = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_gb.UK_ART6_5;
    render(<BestemmelseHjelpetekst bestemmelse={kode} />);
    expect(screen.getByText(/ikke krav om at utsendingsperioden/)).toBeDefined();
  });

  it("viser hjelpetekster for USA Art 5.2", () => {
    const kode = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us.USA_ART5_2;
    render(<BestemmelseHjelpetekst bestemmelse={kode} />);
    expect(screen.getByText(/medlem i folketrygden/)).toBeDefined();
    expect(screen.getByText(/fem år/)).toBeDefined();
  });

  it("viser tidsbegrensning-unntak for USA Art 5.5", () => {
    const kode = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us.USA_ART5_5;
    render(<BestemmelseHjelpetekst bestemmelse={kode} />);
    expect(screen.getByText(/ikke krav om at utsendingsperioden/)).toBeDefined();
  });

  it("viser hjelpetekster for Canada Art 7", () => {
    const kode = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca.CAN_ART7;
    render(<BestemmelseHjelpetekst bestemmelse={kode} />);
    expect(screen.getByText(/fem år/)).toBeDefined();
  });

  it("viser hjelpetekster for Australia Art 9.3", () => {
    const kode = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_au.AUS_ART9_3;
    render(<BestemmelseHjelpetekst bestemmelse={kode} />);
    expect(screen.getByText(/tre år/)).toBeDefined();
  });
});
