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
  it("rendrer label", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(true);
    render(<InnbetaltTrygdeavgiftInput control={{} as any} redigerbart={true} erNyAarsavregning={false} />);
    expect(screen.getByText("Innbetalt trygdeavgift")).toBeDefined();
  });

  it("rendrer label", () => {
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    render(<InnbetaltTrygdeavgiftInput control={{} as any} redigerbart={true} erNyAarsavregning={false} />);
    expect(screen.getByText("Trygdeavgift fra Avgiftssystemet")).toBeDefined();
  });

  it("viser beskrivelse for ny årsavregning", () => {
    render(<InnbetaltTrygdeavgiftInput control={{} as any} redigerbart={true} erNyAarsavregning={true} />);
    expect(screen.getByText("Du skal kun endre hvis tidligere oppgitte beløp er feil")).toBeDefined();
  });

  it("viser ingen beskrivelse for eksisterende årsavregning", () => {
    render(<InnbetaltTrygdeavgiftInput control={{} as any} redigerbart={true} erNyAarsavregning={false} />);
    expect(screen.queryByText("Du skal kun endre hvis tidligere oppgitte beløp er feil")).toBeNull();
  });

  it("er readOnly når ikke redigerbart", () => {
    render(<InnbetaltTrygdeavgiftInput control={{} as any} redigerbart={false} erNyAarsavregning={false} />);
    expect(screen.getByRole("textbox").getAttribute("readonly")).not.toBeNull();
  });
});
