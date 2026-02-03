import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV, { MKVUtils } from "../../../../../melosyskodeverk";

const mockBestemmelse = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A;

vi.mock("react-redux", () => ({
  useSelector: vi.fn(() => mockBestemmelse),
}));

vi.mock("../../../../../ducks/lovvalgsperioder", () => ({
  lovvalgsperioderSelectors: { LovvalgBestemmelseSelector: () => mockBestemmelse },
}));

vi.mock("../../../../../navFrontend", () => ({
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <span>{children}</span>,
  BodyLong: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("../../../../../felleskomponenter/enkeltDato", () => ({
  default: ({ dato }: any) => <span>{dato ?? ""}</span>,
}));

import DatoOgBestemmelse from "./datoOgBestemmelse";

describe("DatoOgBestemmelse", () => {
  it("rendrer lovvalgsperiode og bestemmelse-labels", () => {
    render(<DatoOgBestemmelse fomDato="01.01.2024" tomDato="31.12.2024" />);
    expect(screen.getByText("Lovvalgsperiode")).toBeDefined();
    expect(screen.getByText("Lovvalgsbestemmelse")).toBeDefined();
  });

  it("viser bestemmelse-term fra ekte MKV-kode", () => {
    render(<DatoOgBestemmelse fomDato="01.01.2024" tomDato="31.12.2024" />);
    const expected = MKVUtils.lovvalgsbestemmelseTilObjekt(mockBestemmelse);
    expect(screen.getByText(expected.term!)).toBeDefined();
  });

  it("rendrer datoer", () => {
    render(<DatoOgBestemmelse fomDato="01.01.2024" tomDato="31.12.2024" />);
    expect(screen.getByText("01.01.2024")).toBeDefined();
    expect(screen.getByText("31.12.2024")).toBeDefined();
  });
});
