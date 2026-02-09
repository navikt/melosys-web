import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

let uuidCounter = 0;
vi.mock("../../utils", () => ({
  _isEmpty: (val: any) => !val || val.length === 0,
  _uuid: () => `mock-uuid-${++uuidCounter}`,
}));

vi.mock("../../navFrontend", () => ({
  RadioGroup: ({ children }: any) => <div>{children}</div>,
  Radio: ({ children, value }: any) => (
    <label>
      <input type="radio" value={value} readOnly />
      {children}
    </label>
  ),
}));

vi.mock("../../kodeverk", () => ({
  kodeTilTerm: (kode: string) => (kode === "NO" ? "Norge" : kode),
}));

vi.mock("../../melosyskodeverk", () => ({
  default: { KTObjects: { landkoder: [] } },
}));

import ArbeidslandRadioButtons from "./arbeidslandRadioButtons";

describe("ArbeidslandRadioButtons", () => {
  it("viser melding når ingen land er utfylt", () => {
    render(<ArbeidslandRadioButtons landliste={[]} onChange={vi.fn()} arbeidslandType={undefined} disabled={false} />);
    expect(screen.getByText("Ingen flaggland, sokkelland eller territorialfarvannsland valgt.")).toBeDefined();
  });

  it("viser melding når alle land mangler landkode", () => {
    const liste = [{ type: "Flaggland" as const }];
    render(
      <ArbeidslandRadioButtons landliste={liste} onChange={vi.fn()} arbeidslandType={undefined} disabled={false} />,
    );
    expect(screen.getByText("Ingen flaggland, sokkelland eller territorialfarvannsland valgt.")).toBeDefined();
  });

  it("rendrer radioknapper for utfylte land", () => {
    const liste = [
      { landkode: "NO", type: "Flaggland" as const },
      { landkode: "SE", type: "Sokkelland" as const },
    ];
    render(
      <ArbeidslandRadioButtons landliste={liste} onChange={vi.fn()} arbeidslandType={undefined} disabled={false} />,
    );
    expect(screen.getByText("Norge - Flaggland")).toBeDefined();
    expect(screen.getByText("SE - Sokkelland")).toBeDefined();
  });
});
