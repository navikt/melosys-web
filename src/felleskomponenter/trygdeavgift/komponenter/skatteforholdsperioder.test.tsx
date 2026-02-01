import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../melosyskodeverk";

vi.mock("../../../navFrontend", () => ({
  Radio: ({ children, value }: any) => <label data-value={value}>{children}</label>,
}));

vi.mock("../../forms", () => ({
  Datovelger: ({ label }: any) => <div>{label}</div>,
  RadioGroup: ({ children, legend }: any) => (
    <fieldset>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  ),
}));

vi.mock("../../ui", () => ({
  IkonKnapp: ({ ariaLabel, onClick }: any) => <button aria-label={ariaLabel} onClick={onClick} />,
  Lenkeknapp: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("../../../resources/images", () => ({
  Bin: () => null,
  Add: () => null,
}));

vi.mock("../../../utils", () => ({
  dato: { norskStringTilDate: (d: string) => new Date(d) },
}));

vi.mock("@navikt/ds-react", () => ({
  HGrid: ({ children }: any) => <div>{children}</div>,
  Stack: ({ children }: any) => <div>{children}</div>,
}));

import { Skatteforholdsperioder } from "./skatteforholdsperioder";

describe("Skatteforholdsperioder", () => {
  const defaultProps = {
    formValues: {
      skatteforholdsperioder: [{ fomDato: "01.01.2024", tomDato: "31.12.2024", skatteplikttype: "SKATTEPLIKTIG" }],
    },
    fields: [{ id: "1" }] as any,
    control: {} as any,
    remove: vi.fn(),
    append: vi.fn(),
    redigerbart: true,
  };

  it("rendrer skatteforhold-label og skattepliktig-legend", () => {
    render(<Skatteforholdsperioder {...defaultProps} />);
    expect(screen.getByText("Skatteforhold")).toBeDefined();
    expect(screen.getByText("Skattepliktig")).toBeDefined();
  });

  it("rendrer Ja/Nei med ekte MKV-kodeverdier", () => {
    render(<Skatteforholdsperioder {...defaultProps} />);
    expect(screen.getByText("Ja")).toBeDefined();
    expect(screen.getByText("Nei")).toBeDefined();
    expect(MKV.Koder.skatteplikttype.SKATTEPLIKTIG).toBeDefined();
    expect(MKV.Koder.skatteplikttype.IKKE_SKATTEPLIKTIG).toBeDefined();
  });

  it("rendrer legg-til-knapp", () => {
    render(<Skatteforholdsperioder {...defaultProps} />);
    expect(screen.getByText("Legg til skatteforhold")).toBeDefined();
  });

  it("viser sletteknapp kun når flere enn én periode", () => {
    const props = {
      ...defaultProps,
      formValues: {
        skatteforholdsperioder: [
          { fomDato: "01.01.2024", tomDato: "30.06.2024", skatteplikttype: "SKATTEPLIKTIG" },
          { fomDato: "01.07.2024", tomDato: "31.12.2024", skatteplikttype: "IKKE_SKATTEPLIKTIG" },
        ],
      },
      fields: [{ id: "1" }, { id: "2" }] as any,
    };
    render(<Skatteforholdsperioder {...props} />);
    const slettButtons = screen.getAllByRole("button", { name: "Slett skatteforhold" });
    expect(slettButtons).toHaveLength(2);
  });
});
