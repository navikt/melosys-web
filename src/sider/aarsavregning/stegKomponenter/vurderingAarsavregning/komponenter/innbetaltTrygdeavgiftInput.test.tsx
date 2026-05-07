import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InnbetaltTrygdeavgiftInput } from "./innbetaltTrygdeavgiftInput";
import { useFeatureToggle } from "../../../../../featuretoggle";

vi.mock("../../../../../felleskomponenter/forms", () => ({
  Input: ({ label, description, readOnly, numeric }: any) => (
    <div>
      <label>{label}</label>
      {description && <span>{description}</span>}
      <input readOnly={readOnly} data-numeric={numeric} />
    </div>
  ),
}));

vi.mock("../../../../../featuretoggle/useFeatureToggle", () => ({
  default: vi.fn(),
}));

describe("InnbetaltTrygdeavgiftInput", () => {
  const defaultProps = {
    control: {} as any,
    redigerbart: true,
    erNyAarsavregning: false,
    harInnbetaltTrygdeavgift: true,
    harTidligereTrygdeavgiftsgrunnlag: true,
  };

  it("rendrer label", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    render(<InnbetaltTrygdeavgiftInput {...defaultProps} />);
    expect(screen.getByText("Innbetalt trygdeavgift")).toBeDefined();
  });

  it("rendrer label", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    render(<InnbetaltTrygdeavgiftInput {...defaultProps} />);
    expect(screen.getByText("Trygdeavgift fra Avgiftssystemet")).toBeDefined();
  });

  it("viser beskrivelse for ny årsavregning", () => {
    render(<InnbetaltTrygdeavgiftInput {...defaultProps} erNyAarsavregning={true} />);
    expect(screen.getByText("Du skal kun endre hvis tidligere oppgitte beløp er feil")).toBeDefined();
  });

  it("viser ingen beskrivelse for eksisterende årsavregning", () => {
    render(<InnbetaltTrygdeavgiftInput {...defaultProps} erNyAarsavregning={false} />);
    expect(screen.queryByText("Du skal kun endre hvis tidligere oppgitte beløp er feil")).toBeNull();
  });

  it("er readOnly når ikke redigerbart", () => {
    render(<InnbetaltTrygdeavgiftInput {...defaultProps} redigerbart={false} />);

    expect(screen.getByRole("textbox").getAttribute("readonly")).not.toBeNull();
  });
});
