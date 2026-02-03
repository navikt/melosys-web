import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-redux", () => ({
  connect: () => (comp: any) => comp,
}));

vi.mock("redux-form", () => ({
  formValueSelector: () => () => ({ erHjemmekontor: true, erFastArbeidssted: false }),
}));

vi.mock("../../../../../navFrontend", () => ({
  BodyLong: ({ children }: any) => <span>{children}</span>,
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../../kodeverk", () => ({
  Form: { SOKNAD: "soknad" },
}));

vi.mock("../../../../../utils", () => ({
  _isNil: (val: any) => val === null || val === undefined,
  _capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
  streng: { boolTilNorsk: (val: boolean) => (val ? "ja" : "nei") },
}));

import IkkeEditerbareArbeidPaaLandSporsmal from "./ikkeEditerbareArbeidPaaLandSporsmal";

const Component = IkkeEditerbareArbeidPaaLandSporsmal as any;

describe("IkkeEditerbareArbeidPaaLandSporsmal", () => {
  it("rendrer spørsmålstekster", () => {
    render(<Component erFastArbeidssted={false} erHjemmekontor={true} />);
    expect(screen.getByText(/fast arbeidssted i utlandet/)).toBeDefined();
    expect(screen.getByText(/hovedsaklig arbeide på hjemmekontor/)).toBeDefined();
  });

  it("viser Ja/Nei basert på verdier", () => {
    render(<Component erFastArbeidssted={true} erHjemmekontor={false} />);
    expect(screen.getByText("Ja")).toBeDefined();
    expect(screen.getByText("Nei")).toBeDefined();
  });

  it("viser tom streng for null-verdier", () => {
    render(<Component erFastArbeidssted={null} erHjemmekontor={null} />);
    expect(screen.getByText("Opplysninger om arbeidssted")).toBeDefined();
  });
});
