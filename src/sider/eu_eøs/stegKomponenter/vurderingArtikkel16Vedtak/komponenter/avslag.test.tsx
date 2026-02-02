import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../../../melosyskodeverk";

vi.mock("../../../../../navFrontend", () => ({
  Heading: ({ children }: any) => <h1>{children}</h1>,
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("./datoOgBestemmelse", () => ({
  default: ({ fomDato, tomDato }: any) => (
    <div>
      Periode: {fomDato} - {tomDato}
    </div>
  ),
}));

vi.mock("./vedtakBegrunnelser", () => ({
  default: ({ anmodningsperiodeSvarType }: any) => <div>Begrunnelser: {anmodningsperiodeSvarType}</div>,
}));

vi.mock("../../../../../felleskomponenter/dokumentliste", () => ({
  default: ({ dokumenter }: any) => <div>Dokumenter: {dokumenter.length}</div>,
}));

import { Avslag } from "./avslag";

const defaultProps = {
  redigerbart: false,
  behandlingID: 123,
  vedtaksbrevFritekst: "fritekst",
  renderFritekstFelt: () => <div>Fritekstfelt</div>,
  visOrienteringsbrevArbeidsgiver: false,
  gjeldendePeriode: { fom: "2024-01-01", tom: "2024-12-31" },
  erStorbrittaniaArt18_1Bestemmelse: false,
};

describe("Avslag", () => {
  it("rendrer overskrift", () => {
    render(<Avslag {...defaultProps} />);
    expect(screen.getByText("Avslag")).toBeDefined();
  });

  it("rendrer periode", () => {
    render(<Avslag {...defaultProps} />);
    expect(screen.getByText(/Periode: 2024-01-01/)).toBeDefined();
  });

  it("rendrer begrunnelser med AVSLAG-type", () => {
    render(<Avslag {...defaultProps} />);
    expect(screen.getByText(`Begrunnelser: ${MKV.Koder.anmodningsperiodesvartyper.AVSLAG}`)).toBeDefined();
  });

  it("viser dokumentliste når redigerbart", () => {
    render(<Avslag {...defaultProps} redigerbart={true} />);
    expect(screen.getByText(/Dokumenter: 1/)).toBeDefined();
  });

  it("skjuler dokumentliste når ikke redigerbart", () => {
    render(<Avslag {...defaultProps} redigerbart={false} />);
    expect(screen.queryByText(/Dokumenter:/)).toBeNull();
  });

  it("legger til arbeidsgiverbrev når visOrienteringsbrevArbeidsgiver", () => {
    render(<Avslag {...defaultProps} redigerbart={true} visOrienteringsbrevArbeidsgiver={true} />);
    expect(screen.getByText(/Dokumenter: 3/)).toBeDefined();
  });

  it("rendrer fritekstfelt", () => {
    render(<Avslag {...defaultProps} />);
    expect(screen.getByText("Fritekstfelt")).toBeDefined();
  });
});
