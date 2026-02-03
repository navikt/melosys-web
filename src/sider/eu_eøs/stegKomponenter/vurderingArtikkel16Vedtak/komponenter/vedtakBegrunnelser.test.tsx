import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../../../melosyskodeverk";

const mockVilkarBegrunnelser = vi.fn(() => []);
const mockArbeidstakerBegrunnelser = vi.fn(() => [] as any[]);
const mockNaeringsdrivendeBegrunnelser = vi.fn(() => [] as any[]);

vi.mock("react-redux", () => ({
  useSelector: vi.fn((selector: any) => selector()),
}));

vi.mock("../../../../../ducks/vilkar", () => ({
  vilkarSelectors: {
    VilkarBegrunnelserSelector: () => mockVilkarBegrunnelser(),
    UtsendingsvilkårArbeidstakerBegrunnelserSelector: () => mockArbeidstakerBegrunnelser(),
    UtsendingsvilkårNæringsdrivendeBegrunnelserSelector: () => mockNaeringsdrivendeBegrunnelser(),
  },
}));

vi.mock("../../../../../felleskomponenter/begrunnelser", () => ({
  default: ({ label, fritekst }: any) => (
    <div>
      {label}
      {fritekst && ` - ${fritekst}`}
    </div>
  ),
}));

import { VedtakBegrunnelser } from "./vedtakBegrunnelser";

describe("VedtakBegrunnelser", () => {
  beforeEach(() => {
    mockVilkarBegrunnelser.mockReturnValue([]);
    mockArbeidstakerBegrunnelser.mockReturnValue([]);
    mockNaeringsdrivendeBegrunnelser.mockReturnValue([]);
  });

  it("rendrer ingenting når ingen begrunnelser finnes", () => {
    const { container } = render(<VedtakBegrunnelser anmodningsperiodeSvarType="" />);
    expect(container.innerHTML).toBe("");
  });

  it("rendrer avslag-begrunnelse for AVSLAG svartype", () => {
    render(<VedtakBegrunnelser anmodningsperiodeSvarType={MKV.Koder.anmodningsperiodesvartyper.AVSLAG} />);
    expect(screen.getByText(/kriteriene for unntak/)).toBeDefined();
  });

  it("rendrer arbeidstaker-begrunnelser når de finnes", () => {
    mockArbeidstakerBegrunnelser.mockReturnValue([{ kode: "TEST" }]);
    render(<VedtakBegrunnelser anmodningsperiodeSvarType="" />);
    expect(screen.getByText(/utsending av arbeidstaker/)).toBeDefined();
  });

  it("rendrer næringsdrivende-begrunnelser når de finnes", () => {
    mockNaeringsdrivendeBegrunnelser.mockReturnValue([{ kode: "TEST" }]);
    render(<VedtakBegrunnelser anmodningsperiodeSvarType="" />);
    expect(screen.getByText(/utsending av næringsdrivende/)).toBeDefined();
  });
});
