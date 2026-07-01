import { render, screen } from "@testing-library/react";
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
      sorterEtterISOFomDato: (a: { fom?: string; fomDato?: string }, b: { fom?: string; fomDato?: string }) => {
        const fom1 = a.fomDato ?? a.fom ?? "";
        const fom2 = b.fomDato ?? b.fom ?? "";
        return new Date(fom1).getTime() - new Date(fom2).getTime();
      },
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
          type: "MEDLEMSKAPSPERIODE",
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
          trygdedekning: "FULL",
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

  it("sorterer perioder i stigende rekkefølge etter fom-dato", () => {
    const grunnlagMedFlerePerioder: Grunnlagsopplysninger = {
      trygdeavgiftsgrunnlag: {
        avgiftspliktigperioder: [
          {
            type: "LOVVALGSPERIODE",
            fomDato: "2021-01-01",
            tomDato: "2023-12-31",
            medlemskapstype: "PLIKTIG",
            trygdedekning: "FULL",
            id: 1,
            bestemmelse: "",
            innvilgelsesResultat: "",
          },
        ],
        skatteforholdsperioder: [{ fomDato: "2021-01-01", tomDato: "2023-12-31", skatteplikttype: "SKATTEPLIKTIG" }],
        inntektskperioder: [],
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
            trygdedekning: "FULL",
          },
          {
            fom: "2021-01-01",
            tom: "2021-12-31",
            inntektskildetype: "ARBEID",
            arbeidsgiversavgiftBetales: true,
            inntektPerMd: 41667,
            avgiftssats: 8.2,
            avgiftPerMd: 3417,
            trygdedekning: "FULL",
          },
          {
            fom: "2022-01-01",
            tom: "2022-12-31",
            inntektskildetype: "ARBEID",
            arbeidsgiversavgiftBetales: true,
            inntektPerMd: 41667,
            avgiftssats: 8.2,
            avgiftPerMd: 3417,
            trygdedekning: "FULL",
          },
        ],
        totalInntekt: 1500000,
        totalAvgift: 123000,
      },
    };

    render(<BeregnetTrygdeavgiftDetaljer grunnlag={grunnlagMedFlerePerioder} medlemskapsTypeErPliktig={true} />);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("01.01.2021");
    expect(rows[2]).toHaveTextContent("01.01.2022");
    expect(rows[3]).toHaveTextContent("01.01.2023");
  });

  it("viser '*' i Sats-kolonne og fotnote ved 25 %-regelen", () => {
    const grunnlag = createMockData();
    grunnlag.avgift.trygdeavgiftsperioder[0].beregningsregel = "TJUEFEM_PROSENT_REGEL";
    grunnlag.avgift.trygdeavgiftsperioder[0].avgiftssats = null;

    render(<BeregnetTrygdeavgiftDetaljer grunnlag={grunnlag} medlemskapsTypeErPliktig={true} />);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("*");
    expect(screen.getByText(/Beregnet etter 25 %-regelen/)).toBeInTheDocument();
  });

  it("viser '**' i Sats-kolonne og fotnote ved inntekt under minstebeløpet (når ikke alle perioder er minstebeløp)", () => {
    const grunnlag = createMockData();
    grunnlag.avgift.trygdeavgiftsperioder = [
      {
        fom: "2023-01-01",
        tom: "2023-06-30",
        inntektskildetype: "ARBEID",
        arbeidsgiversavgiftBetales: true,
        inntektPerMd: 41667,
        avgiftssats: 8.2,
        avgiftPerMd: 3417,
      },
      {
        fom: "2023-07-01",
        tom: "2023-12-31",
        inntektskildetype: "ARBEID",
        arbeidsgiversavgiftBetales: true,
        inntektPerMd: 5000,
        avgiftssats: null,
        avgiftPerMd: 0,
        beregningsregel: "MINSTEBELØP",
      },
    ];

    render(<BeregnetTrygdeavgiftDetaljer grunnlag={grunnlag} medlemskapsTypeErPliktig={true} />);

    const rows = screen.getAllByRole("row");
    expect(rows[2]).toHaveTextContent("**");
    expect(screen.getByText(/Inntekten er under minstebeløpet/)).toBeInTheDocument();
  });

  it("viser '***' i Inntektskilde-kolonne og fotnote ved sammenslåtte inntektskilder", () => {
    const grunnlag = createMockData();
    grunnlag.avgift.trygdeavgiftsperioder[0].harSammenslåtteInntektskilder = true;

    render(<BeregnetTrygdeavgiftDetaljer grunnlag={grunnlag} medlemskapsTypeErPliktig={true} />);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("***");
    expect(screen.getByText(/Mer enn en inntekt/)).toBeInTheDocument();
  });

  it("viser 'Helsedel' i Dekning-kolonne for avgiftsdel HELSE", () => {
    const grunnlag = createMockData();
    grunnlag.avgift.trygdeavgiftsperioder[0].avgiftsdel = "HELSE";

    render(<BeregnetTrygdeavgiftDetaljer grunnlag={grunnlag} medlemskapsTypeErPliktig={false} />);

    expect(screen.getByText("Helsedel")).toBeInTheDocument();
  });

  it("viser 'Pensjonsdel' i Dekning-kolonne for avgiftsdel PENSJON", () => {
    const grunnlag = createMockData();
    grunnlag.avgift.trygdeavgiftsperioder[0].avgiftsdel = "PENSJON";

    render(<BeregnetTrygdeavgiftDetaljer grunnlag={grunnlag} medlemskapsTypeErPliktig={false} />);

    expect(screen.getByText("Pensjonsdel")).toBeInTheDocument();
  });

  it("viser ikke fotnote-seksjon ved ordinær beregning", () => {
    render(<BeregnetTrygdeavgiftDetaljer grunnlag={createMockData()} medlemskapsTypeErPliktig={true} />);

    expect(screen.queryByText(/Beregnet etter 25 %-regelen/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Inntekten er under minstebeløpet/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mer enn en inntekt/)).not.toBeInTheDocument();
  });

  it("viser Alert i stedet for tabell når alle perioder er under minstebeløpet", () => {
    const grunnlag = createMockData();
    grunnlag.avgift.trygdeavgiftsperioder[0].beregningsregel = "MINSTEBELØP";
    grunnlag.avgift.trygdeavgiftsperioder[0].avgiftssats = null;
    grunnlag.avgift.trygdeavgiftsperioder[0].avgiftPerMd = 0;

    render(<BeregnetTrygdeavgiftDetaljer grunnlag={grunnlag} medlemskapsTypeErPliktig={true} />);

    expect(screen.getByText("Trygdeavgift skal ikke betales da inntekten er under minstebeløpet.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("viser tabell med '**' når noen men ikke alle perioder er under minstebeløpet", () => {
    const grunnlag = createMockData();
    grunnlag.avgift.trygdeavgiftsperioder = [
      {
        fom: "2023-01-01",
        tom: "2023-06-30",
        inntektskildetype: "ARBEID",
        arbeidsgiversavgiftBetales: true,
        inntektPerMd: 41667,
        avgiftssats: 8.2,
        avgiftPerMd: 3417,
        beregningsregel: undefined,
      },
      {
        fom: "2023-07-01",
        tom: "2023-12-31",
        inntektskildetype: "ARBEID",
        arbeidsgiversavgiftBetales: true,
        inntektPerMd: 5000,
        avgiftssats: null,
        avgiftPerMd: 0,
        beregningsregel: "MINSTEBELØP",
      },
    ];

    render(<BeregnetTrygdeavgiftDetaljer grunnlag={grunnlag} medlemskapsTypeErPliktig={true} />);

    expect(
      screen.queryByText("Trygdeavgift skal ikke betales da inntekten er under minstebeløpet."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText(/Inntekten er under minstebeløpet/)).toBeInTheDocument();
  });
});
