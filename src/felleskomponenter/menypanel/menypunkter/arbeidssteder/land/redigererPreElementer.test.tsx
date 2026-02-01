import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../navFrontend", () => ({
  BodyLong: ({ children }: any) => <span>{children}</span>,
  Row: ({ children }: any) => <div>{children}</div>,
  Radio: ({ children }: any) => <label>{children}</label>,
}));

vi.mock("../../../../skjema", () => ({
  RadioGroup: ({ legend, children }: any) => (
    <fieldset>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  ),
}));

import RedigererPreElementer from "./redigererPreElementer";

describe("RedigererPreElementer", () => {
  it("rendrer overskrift og to spørsmål", () => {
    render(<RedigererPreElementer redigerbart={true} />);
    expect(screen.getByText("Opplysninger om arbeidssted")).toBeDefined();
    expect(screen.getByText("Vil arbeidstakeren ha et fast arbeidssted i utlandet?")).toBeDefined();
    expect(screen.getByText(/hjemmekontor/)).toBeDefined();
  });

  it("rendrer Ja/Nei for begge spørsmål", () => {
    render(<RedigererPreElementer redigerbart={true} />);
    expect(screen.getAllByText("Ja")).toHaveLength(2);
    expect(screen.getAllByText("Nei")).toHaveLength(2);
  });
});
