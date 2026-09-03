import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../../../melosyskodeverk";

vi.mock("../../../../../navFrontend", () => ({
  Heading: ({ children }: any) => <h2>{children}</h2>,
  HStack: ({ children }: any) => <div>{children}</div>,
  Radio: ({ children, value }: any) => <label data-value={value}>{children}</label>,
}));

vi.mock("../../../../../felleskomponenter/forms", () => ({
  RadioGroup: ({ children, name }: any) => <div data-testid={name}>{children}</div>,
}));

import { EndeligAvgiftValgRadioGroup } from "./endeligAvgiftValgRadioGroup";

describe("EndeligAvgiftValgRadioGroup", () => {
  const defaultProps = {
    control: {} as any,
    redigerbart: true,
    handleEndeligAvgiftValgChange: vi.fn(),
    endeligAvgiftValg: undefined as string | undefined,
  };

  it("rendrer begge radioknapper", () => {
    render(<EndeligAvgiftValgRadioGroup {...defaultProps} />);
    expect(screen.getByText("Beregn trygdeavgiften")).toBeDefined();
    expect(screen.getByText("Oppgi beløp for beregnet trygdeavgift")).toBeDefined();
  });

  it("rendrer ikke valget for periode fra avgiftssystemet", () => {
    render(<EndeligAvgiftValgRadioGroup {...defaultProps} />);
    expect(screen.queryByText("Beregn trygdeavgift med periode fra avgiftssystemet")).toBeNull();
  });

  it("markerer valgt radioknapp via checked-klassen", () => {
    render(
      <EndeligAvgiftValgRadioGroup
        {...defaultProps}
        endeligAvgiftValg={MKV.Koder.endeligAvgiftValg.MANUELL_ENDELIG_AVGIFT}
      />,
    );
    const valgtRadio = screen.getByText("Oppgi beløp for beregnet trygdeavgift");
    expect(valgtRadio.getAttribute("data-value")).toBe(MKV.Koder.endeligAvgiftValg.MANUELL_ENDELIG_AVGIFT);
  });

  it("bruker ekte MKV-kodeverdier for de to radioknappene", () => {
    render(<EndeligAvgiftValgRadioGroup {...defaultProps} />);
    const labels = screen.getByTestId("endeligAvgiftValg").querySelectorAll("label");
    expect(labels).toHaveLength(2);
    expect(labels[0].getAttribute("data-value")).toBe(MKV.Koder.endeligAvgiftValg.OPPLYSNINGER_ENDRET);
    expect(labels[1].getAttribute("data-value")).toBe(MKV.Koder.endeligAvgiftValg.MANUELL_ENDELIG_AVGIFT);
  });
});
