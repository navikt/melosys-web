import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Grunnlagsopplysninger } from "../../../../../services/modules/aarsavregning/aarsavregning";
import { BeregnetTrygdeavgiftDetaljer } from "./beregnetTrygdeavgiftDetaljer";

vi.mock("../../../../../utils", () => {
  let uuidCounter = 0;
  return {
    formaterTilNorskBelopUtenDesimaler: vi.fn((amount) => `${amount?.toLocaleString("nb-NO") || "0"}`),
    _uuid: vi.fn(() => `mock-uuid-${++uuidCounter}`),
    dato: {
      formatterDatoTilNorsk: vi.fn((date) => {
        if (!date) return "";
        const [year, month, day] = date.split("-");
        return `${day}.${month}.${year}`;
      }),
    },
  };
});

vi.mock("../../../../../kodeverk", () => ({
  finnTermFraListe: vi.fn((list, code) => code || "Unknown"),
}));

vi.mock("../../../../../melosyskodeverk", () => ({
  default: {
    KTObjects: {
      inntektskildetype: [],
      trygdedekninger: [],
    },
    Koder: {
      skatteplikttype: {
        SKATTEPLIKTIG: "SKATTEPLIKTIG",
      },
      inntektskildetype: {
        MISJONÆR: "MISJONÆR",
      },
    },
  },
}));

describe("BeregnetTrygdeavgiftDetaljer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockData = (): Grunnlagsopplysninger => ({
    trygdeavgiftsgrunnlag: {
      avgiftspliktigperioder: [
        {
          fomDato: "2023-01-01",
          tomDato: "2023-12-31",
          medlemskapstype: "PLIKTIG",
          trygdedekning: "FULL",
          id: 1,
          bestemmelse: "mock-bestemmelse",
          innvilgelsesResultat: "mock-innvilgelsesResultat",
        },
      ],
      skatteforholdsperioder: [
        {
          fomDato: "2023-01-01",
          tomDato: "2023-12-31",
          skatteplikttype: "SKATTEPLIKTIG",
        },
      ],
      inntektskperioder: [
        {
          fomDato: "2023-01-01",
          tomDato: "2023-12-31",
          type: "ARBEID",
          arbeidsgiversavgiftBetales: true,
          avgiftspliktigInntekt: 500000,
          erMaanedsbelop: false,
        },
      ],
    },
    avgift: {
      trygdeavgiftsperioder: [
        {
          fom: "2023-01-01",
          tom: "2023-12-31",
          inntektskildetype: "ARBEID",
          arbeidsgiversavgiftBetales: true,
          inntektPerMd: 41667,
          avgiftssats: 8.2,
          avgiftPerMd: 3417,
        },
      ],
      totalInntekt: 500000,
      totalAvgift: 41000,
    },
  });

  it("does not render when grunnlag is undefined", () => {
    const { container } = render(<BeregnetTrygdeavgiftDetaljer grunnlag={undefined} medlemskapsTypeErPliktig={true} />);

    expect(container.firstChild).toBeNull();
  });

  it("does not render when avgift is undefined", () => {
    const grunnlagUtenAvgift = {
      trygdeavgiftsgrunnlag: createMockData().trygdeavgiftsgrunnlag,
      avgift: undefined,
    } as any;

    const { container } = render(
      <BeregnetTrygdeavgiftDetaljer grunnlag={grunnlagUtenAvgift} medlemskapsTypeErPliktig={true} />,
    );

    expect(container.firstChild).toBeNull();
  });
  it("snapshot test", () => {
    const { container } = render(
      <BeregnetTrygdeavgiftDetaljer grunnlag={createMockData()} medlemskapsTypeErPliktig={true} />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
