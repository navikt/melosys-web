import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../../melosyskodeverk";

vi.mock("react-redux", () => ({
  useSelector: vi.fn(() => ({
    avsenderType: MKV.Koder.avsendertyper.ORGANISASJON,
  })),
}));

vi.mock("redux-form", () => ({
  getFormValues: () => () => ({
    avsenderType: MKV.Koder.avsendertyper.ORGANISASJON,
  }),
}));

vi.mock("../../../../kodeverk", () => ({
  Form: { JOURNALFORING: "journalforing" },
  AvsenderTyper: { FRITEKST: "FRITEKST" },
}));

vi.mock("../../../../felleskomponenter/skjema", () => ({
  RadioGroup: ({ children, legend }: any) => (
    <fieldset>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  ),
  Input: ({ label }: any) => <input aria-label={label} />,
}));

vi.mock("../../../../navFrontend", () => ({
  Radio: ({ children, value }: any) => <label data-value={value}>{children}</label>,
}));

import { AvsenderVelgerForVirksomhet } from "./avsenderVelgerForVirksomhet";

describe("AvsenderVelgerForVirksomhet", () => {
  const defaultProps = {
    tomAvsender: vi.fn(),
    kopierVirksomhetTilAvsender: vi.fn(),
    mottaksKanalErElektronisk: false,
  };

  it("rendrer legend-tekst", () => {
    render(<AvsenderVelgerForVirksomhet {...defaultProps} />);
    expect(screen.getByText("Hvem er avsender?")).toBeDefined();
  });

  it("rendrer Virksomhet og Fritekst radio-valg", () => {
    render(<AvsenderVelgerForVirksomhet {...defaultProps} />);
    expect(screen.getByText("Virksomhet")).toBeDefined();
    expect(screen.getByText("Fritekst")).toBeDefined();
  });

  it("kaller kopierVirksomhetTilAvsender for ORGANISASJON", () => {
    render(<AvsenderVelgerForVirksomhet {...defaultProps} />);
    expect(defaultProps.kopierVirksomhetTilAvsender).toHaveBeenCalled();
  });
});
