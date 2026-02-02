import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../../melosyskodeverk";

vi.mock("react-redux", () => ({
  useSelector: vi.fn(() => []),
}));

vi.mock("../../../../ducks/avklartefakta", () => ({
  avklartefaktaSelectors: {
    ArbeidslandSelector: () => [],
  },
}));

vi.mock("../../../../felleskomponenter/ui", () => ({
  StegKnapper: ({ bekreftKnappProps, tilbakeKnappProps }: any) => (
    <div>
      <button disabled={bekreftKnappProps.disabled} onClick={bekreftKnappProps.onClick}>
        Bekreft
      </button>
      <button disabled={tilbakeKnappProps.disabled} onClick={tilbakeKnappProps.onClick}>
        Tilbake
      </button>
    </div>
  ),
}));

vi.mock("../../../../navFrontend", () => ({
  Heading: ({ children }: any) => <h1>{children}</h1>,
}));

vi.mock("./bestemmelser", () => ({
  default: ({ begrunnelserUtsending }: any) => (
    <div data-testid="bestemmelser">Begrunnelser: {begrunnelserUtsending?.length}</div>
  ),
}));

import VurderingArtikkel12_x from "./vurderingArtikkel12_x";

describe("VurderingArtikkel12_x", () => {
  const defaultProps = {
    bekreftOgFortsett: vi.fn(),
    tilstand: { harAvklaring: false, artikkelNavn: "12.1" as const },
    oppdaterData: vi.fn(),
    slettData: vi.fn(),
    tilbake: vi.fn(),
    redigerbart: true,
  };

  it("rendrer overskrift for arbeidstaker (12.1)", () => {
    render(<VurderingArtikkel12_x {...defaultProps} />);
    expect(screen.getByText("Vurdering arbeidstaker")).toBeDefined();
  });

  it("rendrer overskrift for næringsdrivende (12.2)", () => {
    render(<VurderingArtikkel12_x {...defaultProps} tilstand={{ harAvklaring: false, artikkelNavn: "12.2" }} />);
    expect(screen.getByText("Vurdering næringsdrivende")).toBeDefined();
  });

  it("sender arbeidstaker-begrunnelser for 12.1", () => {
    render(<VurderingArtikkel12_x {...defaultProps} />);
    const count = MKV.KTObjects.begrunnelser.utsendt_arbeidstaker_begrunnelser.length;
    expect(screen.getByText(`Begrunnelser: ${count}`)).toBeDefined();
  });

  it("sender næringsdrivende-begrunnelser for 12.2", () => {
    render(<VurderingArtikkel12_x {...defaultProps} tilstand={{ harAvklaring: false, artikkelNavn: "12.2" }} />);
    const count = MKV.KTObjects.begrunnelser.utsendt_naeringsdrivende_begrunnelser.length;
    expect(screen.getByText(`Begrunnelser: ${count}`)).toBeDefined();
  });

  it("deaktiverer bekreft-knapp når ikke harAvklaring", () => {
    render(<VurderingArtikkel12_x {...defaultProps} />);
    expect(screen.getByText("Bekreft").closest("button")).toHaveAttribute("disabled");
  });
});
