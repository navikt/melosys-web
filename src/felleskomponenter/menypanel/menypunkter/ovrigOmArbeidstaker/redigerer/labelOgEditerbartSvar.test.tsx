import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Radio: ({ children, value }: any) => (
    <label>
      <input type="radio" value={String(value)} readOnly />
      {children}
    </label>
  ),
}));

vi.mock("../../../../skjema", () => ({
  RadioGroup: ({ legend, children }: any) => (
    <fieldset>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  ),
}));

import LabelOgEditerbartSvar from "./labelOgEditerbartSvar";

describe("LabelOgEditerbartSvar", () => {
  it("rendrer legend med label-tekst", () => {
    render(<LabelOgEditerbartSvar label="Har arbeidstaker familie?" feltNavn="harFamilie" />);
    expect(screen.getByText("Har arbeidstaker familie?")).toBeDefined();
  });

  it("rendrer Ja og Nei radio-valg", () => {
    render(<LabelOgEditerbartSvar label="Test" feltNavn="test" />);
    expect(screen.getByText("Ja")).toBeDefined();
    expect(screen.getByText("Nei")).toBeDefined();
  });
});
