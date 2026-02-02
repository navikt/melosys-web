import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../navFrontend", () => ({
  Container: ({ children }: any) => <div>{children}</div>,
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
  Heading: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock("../../../../kodeverk", () => ({
  Menypunkter: { Person: { tittel: "Personopplysninger" } },
}));

vi.mock("./person", () => ({
  default: ({ visArbeidsforholdRolleEtiketter, visMottatteOpplysningerData }: any) => (
    <div>
      Person rolle={String(visArbeidsforholdRolleEtiketter)} mottatt={String(visMottatteOpplysningerData)}
    </div>
  ),
}));

import PersonContainer from "./personcontainer";

describe("PersonContainer", () => {
  it("rendrer tittel fra kodeverk", () => {
    render(
      <PersonContainer
        {...({ visArbeidsforholdRolleEtiketter: true, visMottatteOpplysningerData: false, endreFokus: vi.fn() } as any)}
      />,
    );
    expect(screen.getByText("Personopplysninger")).toBeDefined();
  });

  it("sender props videre til Person", () => {
    render(
      <PersonContainer
        {...({ visArbeidsforholdRolleEtiketter: true, visMottatteOpplysningerData: false, endreFokus: vi.fn() } as any)}
      />,
    );
    expect(screen.getByText(/Person rolle=true mottatt=false/)).toBeDefined();
  });
});
