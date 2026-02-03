import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../../navFrontend", () => ({
  Column: ({ children }: any) => <div>{children}</div>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../../enkeltDato", () => ({
  default: ({ dato }: any) => <span>{dato}</span>,
}));

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

vi.mock("../../../../../../ducks/landkoder", () => ({
  landkoderSelectors: { LandkoderSelector: "LandkoderSelector" },
}));

import { useSelector } from "react-redux";
import { Fødsel } from "./fødsel";

describe("Fødsel", () => {
  beforeEach(() => {
    vi.mocked(useSelector).mockReturnValue([{ kode: "NO", term: "Norge" }]);
  });

  it("viser fødselsnummer", () => {
    render(<Fødsel personopplysninger="12345678901" erLitenSkjerm={false} />);
    expect(screen.getByText("Fødselsnummer:")).toBeDefined();
    expect(screen.getByText("12345678901")).toBeDefined();
  });

  it("viser bindestrek når data mangler", () => {
    render(<Fødsel erLitenSkjerm={false} />);
    expect(screen.getAllByText("-")).toHaveLength(4);
  });

  it("viser fødselsdato når den finnes", () => {
    render(<Fødsel fødsel={{ foedselsdato: "2000-01-15" }} erLitenSkjerm={false} />);
    expect(screen.getByText("2000-01-15")).toBeDefined();
  });

  it("viser fødselsår når fødselsdato mangler", () => {
    render(<Fødsel fødsel={{ foedselsaar: 1990 }} erLitenSkjerm={false} />);
    expect(screen.getByText("1990")).toBeDefined();
  });

  it("viser fødeland fra landkoder", () => {
    render(<Fødsel fødsel={{ foedeland: "NO" }} erLitenSkjerm={false} />);
    expect(screen.getByText("Norge")).toBeDefined();
  });

  it("viser fødested", () => {
    render(<Fødsel fødsel={{ foedested: "Oslo" }} erLitenSkjerm={false} />);
    expect(screen.getByText("Oslo")).toBeDefined();
  });
});
