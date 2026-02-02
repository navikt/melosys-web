import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV, { MKVUtils } from "../../../../melosyskodeverk";

vi.mock("../../../../navFrontend", () => ({
  Select: ({ children, label, ...rest }: any) => (
    <div>
      <label>{label}</label>
      <select {...rest}>{children}</select>
    </div>
  ),
}));

import Bestemmelse, { tilleggsbestemmelseFraLovvalgsbestemmelse } from "./bestemmelse";

const { FO_883_2004_ART11_3A, FO_883_2004_ART11_4_2 } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004;
const { FO_883_2004_ART11_4_1 } = MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004;
const { KONV_EFTA_STORBRITANNIA_ART13_3A } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia;
const { KONV_EFTA_STORBRITANNIA_ART13_4_1 } =
  MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_konv_efta_storbritannia;

describe("tilleggsbestemmelseFraLovvalgsbestemmelse", () => {
  it("returnerer ART11_4_1 for ART11_3A", () => {
    expect(tilleggsbestemmelseFraLovvalgsbestemmelse(FO_883_2004_ART11_3A)).toBe(FO_883_2004_ART11_4_1);
  });

  it("returnerer KONV_EFTA_STORBRITANNIA_ART13_4_1 for KONV_EFTA_STORBRITANNIA_ART13_3A", () => {
    expect(tilleggsbestemmelseFraLovvalgsbestemmelse(KONV_EFTA_STORBRITANNIA_ART13_3A)).toBe(
      KONV_EFTA_STORBRITANNIA_ART13_4_1,
    );
  });

  it("returnerer undefined for ukjent bestemmelse", () => {
    expect(tilleggsbestemmelseFraLovvalgsbestemmelse("UKJENT")).toBeUndefined();
  });
});

describe("Bestemmelse", () => {
  const defaultProps = {
    handleEndreBestemmelse: vi.fn(),
    artikkelValg: undefined,
    redigerbart: true,
    visStorbritanniaKonvensjon: false,
  };

  it("rendrer select med label", () => {
    render(<Bestemmelse {...defaultProps} />);
    expect(screen.getByText("Velg bestemmelse")).toBeDefined();
  });

  it("viser Velg...-option som default", () => {
    render(<Bestemmelse {...defaultProps} />);
    const options = screen.getAllByRole("option");
    expect(options[0].getAttribute("label") === "Velg..." || options[0].textContent === "Velg...").toBe(true);
  });

  it("viser ART11_3A for ART11_4_1 uten Storbritannia", () => {
    render(<Bestemmelse {...defaultProps} artikkelValg={"ART11_4_1" as any} />);
    const art11_3a = MKVUtils.lovvalgsbestemmelseTilObjekt(FO_883_2004_ART11_3A);
    const options = screen.getAllByRole("option");
    expect(options.some((o) => o.getAttribute("label") === art11_3a.term)).toBe(true);
  });

  it("viser ART11_4_2 for ART11_4_2 uten Storbritannia", () => {
    render(<Bestemmelse {...defaultProps} artikkelValg={"ART11_4_2" as any} />);
    const art11_4_2 = MKVUtils.lovvalgsbestemmelseTilObjekt(FO_883_2004_ART11_4_2);
    const options = screen.getAllByRole("option");
    expect(options.some((o) => o.getAttribute("label") === art11_4_2.term)).toBe(true);
  });

  it("viser to bestemmelser med Storbritannia for ART11_4_1", () => {
    render(<Bestemmelse {...defaultProps} artikkelValg={"ART11_4_1" as any} visStorbritanniaKonvensjon={true} />);
    const options = screen.getAllByRole("option");
    // Velg... + ART13_3A + ART11_3A = 3
    expect(options.length).toBeGreaterThanOrEqual(3);
  });

  it("returnerer tom liste når artikkelValg er undefined", () => {
    render(<Bestemmelse {...defaultProps} />);
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1); // bare Velg...
  });
});
