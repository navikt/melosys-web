import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../../../melosyskodeverk";

vi.mock("../../../../../navFrontend", () => ({
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
    expect(screen.getByText("Beregn endelig trygdeavgift")).toBeDefined();
    expect(screen.getByText("Oppgi endelig beregnet trygdeavgift")).toBeDefined();
  });

  it("bruker ekte MKV-kodeverdier", () => {
    render(<EndeligAvgiftValgRadioGroup {...defaultProps} />);
    const labels = screen.getAllByText(/trygdeavgift/);
    expect(labels).toHaveLength(2);
    // Verifiser at MKV-kodene finnes
    expect(MKV.Koder.endeligAvgiftValg.OPPLYSNINGER_ENDRET).toBeDefined();
    expect(MKV.Koder.endeligAvgiftValg.MANUELL_ENDELIG_AVGIFT).toBeDefined();
  });
});
