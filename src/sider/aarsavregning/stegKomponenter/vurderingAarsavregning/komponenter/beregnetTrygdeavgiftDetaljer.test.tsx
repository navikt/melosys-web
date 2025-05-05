import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BeregnetTrygdeavgiftDetaljer } from "./beregnetTrygdeavgiftDetaljer";
import { Grunnlagsopplysninger } from "../../../../../services/modules/aarsavregning/aarsavregning";

const createMockGrunnlag = (overrides: Partial<Grunnlagsopplysninger> = {}): Grunnlagsopplysninger => ({
  avgift: {
    totalInntekt: 0,
    totalAvgift: 0,
    trygdeavgiftsperioder: [],
    ...(overrides.avgift || {}),
  },
  trygdeavgiftsgrunnlag: {
    inntektskperioder: [],
    medlemskapsperioder: [],
    skatteforholdsperioder: [],
    ...(overrides.trygdeavgiftsgrunnlag || {}),
  },
  ...overrides,
});

describe("BeregnetTrygdeavgiftDetaljer", () => {
  it("renders correctly when grunnlag is undefined or null", () => {
    const { container: containerUndefined } = render(
      <BeregnetTrygdeavgiftDetaljer
        grunnlag={undefined}
        medlemskapsTypeErPliktig={false}
        tittel="Test Tittel Undefined"
      />,
    );
    expect(containerUndefined.firstChild).toBeNull();

    const { container: containerNull } = render(
      <BeregnetTrygdeavgiftDetaljer
        grunnlag={null as any}
        medlemskapsTypeErPliktig={false}
        tittel="Test Tittel Null"
      />,
    );
    expect(containerNull.firstChild).toBeNull();
  });

  it("renders correctly with empty grunnlag data", () => {
    const mockGrunnlag = createMockGrunnlag();
    const { container } = render(
      <BeregnetTrygdeavgiftDetaljer
        grunnlag={mockGrunnlag}
        medlemskapsTypeErPliktig={false}
        tittel="Test Tittel Empty"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders correctly with basic avgift period (medlemskapsTypeErPliktig=false)", () => {
    const mockGrunnlag = createMockGrunnlag({
      avgift: {
        totalAvgift: 390,
        totalInntekt: 5000,
        trygdeavgiftsperioder: [
          {
            fom: "2023-01-01",
            tom: "2023-12-31",
            inntektskildetype: "LONN_UTENLANDSK",
            arbeidsgiversavgiftBetales: true,
            inntektPerMd: 5000,
            avgiftssats: 7.8,
            avgiftPerMd: 390,
          },
        ],
      },
      trygdeavgiftsgrunnlag: {
        medlemskapsperioder: [
          {
            id: 1,
            bestemmelse: "FTRL",
            innvilgelsesResultat: "INNVILGET",
            medlemskapstype: "FRIVILLIG",
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            trygdedekning: "FULL",
          },
        ],
        skatteforholdsperioder: [{ fomDato: "2023-01-01", tomDato: "2023-12-31", skatteplikttype: "SKATTEPLIKTIG" }],
        inntektskperioder: [],
      },
    });
    const { container } = render(
      <BeregnetTrygdeavgiftDetaljer
        grunnlag={mockGrunnlag}
        medlemskapsTypeErPliktig={false}
        tittel="Test Tittel Basic False"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders correctly with basic avgift period (medlemskapsTypeErPliktig=true)", () => {
    const mockGrunnlag = createMockGrunnlag({
      avgift: {
        totalAvgift: 390,
        totalInntekt: 5000,
        trygdeavgiftsperioder: [
          {
            fom: "2023-01-01",
            tom: "2023-12-31",
            inntektskildetype: "LONN_UTENLANDSK",
            arbeidsgiversavgiftBetales: true,
            inntektPerMd: 5000,
            avgiftssats: 7.8,
            avgiftPerMd: 390,
          },
        ],
      },
      trygdeavgiftsgrunnlag: {
        medlemskapsperioder: [
          {
            id: 2,
            bestemmelse: "FTRL",
            innvilgelsesResultat: "INNVILGET",
            medlemskapstype: "PLIKTIG",
            fomDato: "2023-01-01",
            tomDato: "2023-12-31",
            trygdedekning: "FULL",
          },
        ],
        skatteforholdsperioder: [
          { fomDato: "2023-01-01", tomDato: "2023-12-31", skatteplikttype: "IKKE_SKATTEPLIKTIG" },
        ],
        inntektskperioder: [],
      },
    });
    const { container } = render(
      <BeregnetTrygdeavgiftDetaljer
        grunnlag={mockGrunnlag}
        medlemskapsTypeErPliktig={true}
        tittel="Test Tittel Basic True"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
