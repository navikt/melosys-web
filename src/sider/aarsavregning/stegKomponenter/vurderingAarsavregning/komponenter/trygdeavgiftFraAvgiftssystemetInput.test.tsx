import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../felleskomponenter/forms", () => ({
  Input: ({ label, description, readOnly, numeric }: any) => (
    <div>
      <label>{label}</label>
      {description && <span>{description}</span>}
      <input readOnly={readOnly} data-numeric={numeric} />
    </div>
  ),
}));

import { TrygdeavgiftFraAvgiftssystemetInput } from "./trygdeavgiftFraAvgiftssystemetInput";

describe("TrygdeavgiftFraAvgiftssystemetInput", () => {
  it("rendrer label", () => {
    render(<TrygdeavgiftFraAvgiftssystemetInput control={{} as any} redigerbart={true} erNyAarsavregning={false} />);
    expect(screen.getByText("Trygdeavgift fra Avgiftssystemet")).toBeDefined();
  });

  it("viser beskrivelse for ny årsavregning", () => {
    render(<TrygdeavgiftFraAvgiftssystemetInput control={{} as any} redigerbart={true} erNyAarsavregning={true} />);
    expect(screen.getByText("Du skal kun endre hvis tidligere oppgitte beløp er feil")).toBeDefined();
  });

  it("viser ingen beskrivelse for eksisterende årsavregning", () => {
    render(<TrygdeavgiftFraAvgiftssystemetInput control={{} as any} redigerbart={true} erNyAarsavregning={false} />);
    expect(screen.queryByText("Du skal kun endre hvis tidligere oppgitte beløp er feil")).toBeNull();
  });

  it("er readOnly når ikke redigerbart", () => {
    render(<TrygdeavgiftFraAvgiftssystemetInput control={{} as any} redigerbart={false} erNyAarsavregning={false} />);
    expect(screen.getByRole("textbox").getAttribute("readonly")).not.toBeNull();
  });
});
