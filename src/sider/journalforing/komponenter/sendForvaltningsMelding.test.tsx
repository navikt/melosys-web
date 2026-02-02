import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../navFrontend", () => ({
  RadioGroup: ({ children, legend }: any) => (
    <fieldset>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  ),
  Radio: ({ children, value, disabled }: any) => (
    <label data-disabled={disabled}>
      <input type="radio" value={value} readOnly />
      {children}
    </label>
  ),
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../kodeverk", () => ({
  AvsenderTyper: { ANNEN_PERSON_ELLER_VIRKSOMHET: "ANNEN_PERSON_ELLER_VIRKSOMHET" },
}));

vi.mock("../../../utils", () => ({
  _uuid: () => "uuid",
}));

import SendForvaltningsMelding from "./sendForvaltningsMelding";

describe("SendForvaltningsMelding", () => {
  const defaultProps = {
    avsenderType: "BRUKER",
    adresseOpplysninger: { harBrukerAdresse: true, harAvsenderAdresse: false },
    settFeltInnhold: vi.fn(),
  };

  it("rendrer legend-tekst", () => {
    render(<SendForvaltningsMelding {...defaultProps} />);
    expect(screen.getByText(/melding om saksbehandlingtid/)).toBeDefined();
  });

  it("rendrer bruker-radio og nei-radio", () => {
    render(<SendForvaltningsMelding {...defaultProps} />);
    expect(screen.getByText(/sendes automatisk til/)).toBeDefined();
    expect(screen.getByText(/sende melding senere/)).toBeDefined();
  });

  it("viser avsender-radio for ANNEN_PERSON_ELLER_VIRKSOMHET", () => {
    render(
      <SendForvaltningsMelding
        {...defaultProps}
        avsenderType="ANNEN_PERSON_ELLER_VIRKSOMHET"
        adresseOpplysninger={{ harBrukerAdresse: true, harAvsenderAdresse: true }}
      />,
    );
    expect(screen.getByText(/avsender/)).toBeDefined();
  });

  it("viser advarsel når bruker mangler adresse", () => {
    render(
      <SendForvaltningsMelding
        {...defaultProps}
        adresseOpplysninger={{ harBrukerAdresse: false, harAvsenderAdresse: false }}
      />,
    );
    expect(screen.getByText(/manglende eller ugyldig adresse/)).toBeDefined();
  });
});
