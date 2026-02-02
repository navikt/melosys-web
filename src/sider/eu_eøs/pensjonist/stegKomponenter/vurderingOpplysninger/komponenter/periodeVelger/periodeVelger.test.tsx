import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MKV from "../../../../../../../melosyskodeverk";

vi.mock("../../../../../../../navFrontend", () => ({
  Heading: ({ children }: any) => <h3>{children}</h3>,
  Row: ({ children }: any) => <div>{children}</div>,
  Column: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../../../../../../felleskomponenter/forms", () => ({
  Datovelger: ({ label }: any) => <div>{label}</div>,
  Select: ({ children, label }: any) => (
    <div>
      <label>{label}</label>
      <select>{children}</select>
    </div>
  ),
}));

vi.mock("../../../../../../../utils", () => ({
  dato: { norskStringTilDate: () => null },
  land: { landTekstFormat: (item: any) => item.term },
}));

import { PeriodeOgLandVelger } from "./periodeVelger";

describe("PeriodeOgLandVelger", () => {
  const defaultProps = {
    redigerbart: true,
    control: {} as any,
    formValues: {},
    handleChange: vi.fn(),
    ukjentSluttdatoKey: "key",
  };

  it("rendrer overskrift og datovelgere", () => {
    render(<PeriodeOgLandVelger {...defaultProps} />);
    expect(screen.getByText("Periode")).toBeDefined();
    expect(screen.getByText("Fra og med")).toBeDefined();
    expect(screen.getByText("Til og med")).toBeDefined();
  });

  it("rendrer bostedsland-select med ekte MKV-landkoder", () => {
    render(<PeriodeOgLandVelger {...defaultProps} />);
    expect(screen.getByText("Bostedsland")).toBeDefined();
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(MKV.KTObjects.landkoder.length);
  });
});
