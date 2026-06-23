import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../navFrontend", () => {
  const ExpansionCard: any = ({ children, open }: any) => <div data-grunnlag-open={String(open)}>{children}</div>;
  ExpansionCard.Header = ({ children }: any) => <div>{children}</div>;
  ExpansionCard.Title = ({ children }: any) => <h3>{children}</h3>;
  ExpansionCard.Description = ({ children }: any) => <p>{children}</p>;
  ExpansionCard.Content = ({ children }: any) => <div>{children}</div>;
  return {
    Alert: ({ children }: any) => <div role="alert">{children}</div>,
    Table: Object.assign(({ children }: any) => <table>{children}</table>, {
      Header: ({ children }: any) => <thead>{children}</thead>,
      Body: ({ children }: any) => <tbody>{children}</tbody>,
      Row: ({ children }: any) => <tr>{children}</tr>,
      HeaderCell: ({ children }: any) => <th>{children}</th>,
      DataCell: ({ children }: any) => <td>{children}</td>,
    }),
    ExpansionCard,
    Tag: ({ children }: any) => <span>{children}</span>,
    BodyShort: ({ children, className }: any) => <span className={className}>{children}</span>,
    Detail: ({ children }: any) => <span>{children}</span>,
  };
});

vi.mock("../../../utils", () => ({
  _uuid: () => String(Math.random()),
  formaterTilNorskBelopUtenDesimaler: (n: number) => String(n),
  dato: {
    formatterDatoTilNorsk: (d: string) => d,
    sorterEtterISOFomDato: (a: any, b: any) => a.fom.localeCompare(b.fom),
  },
}));

vi.mock("../../../kodeverk", () => ({
  finnTermFraListe: (_liste: any, kode: string) => kode,
}));

vi.mock("../../../melosyskodeverk", () => ({
  default: { KTObjects: { trygdedekninger: [], inntektskildetype: [] } },
}));

vi.mock("../../spinner", () => ({
  Spinner: () => <span>Laster...</span>,
}));

const mockUseFeatureToggle = vi.fn(() => false);
vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: () => mockUseFeatureToggle(),
}));

import TrygdeavgiftsperioderTabell from "./trygdeavgiftsperioderTabell";
import { Beregningsforklaring, Trygdeavgiftsperiode } from "../../../services/modules/trygdeavgift";

beforeEach(() => {
  mockUseFeatureToggle.mockReturnValue(false);
});

const lagPeriode = (fom: string, tom: string, overrides?: Partial<Trygdeavgiftsperiode>): Trygdeavgiftsperiode => ({
  fom,
  tom,
  trygdedekning: "FULL",
  inntektskildetype: "LØNN",
  avgiftssats: 7.8,
  avgiftPerMd: 1234,
  ...overrides,
});

describe("TrygdeavgiftsperioderTabell", () => {
  it("returnerer null når perioder er undefined", () => {
    const { container } = render(<TrygdeavgiftsperioderTabell perioder={undefined} lagrePending={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("rendrer headere med dekning-kolonne", () => {
    render(<TrygdeavgiftsperioderTabell perioder={[]} lagrePending={false} />);
    expect(screen.getByText("Trygdeperiode")).toBeDefined();
    expect(screen.getByText("Dekning")).toBeDefined();
    expect(screen.getByText("Sats")).toBeDefined();
    expect(screen.getByText("Avgift per md.")).toBeDefined();
  });

  it("skjuler dekning-kolonne for EØS-pensjonist", () => {
    render(<TrygdeavgiftsperioderTabell perioder={[]} lagrePending={false} erEøsPensjonist />);
    expect(screen.queryByText("Dekning")).toBeNull();
  });

  it("rendrer periodedata med ordinær sats", () => {
    const perioder = [lagPeriode("2024-01-01", "2024-06-30")];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.getByText("2024-01-01 - 2024-06-30")).toBeDefined();
    expect(screen.getByText("7.8")).toBeDefined();
    expect(screen.getByText("1234")).toBeDefined();
  });

  it("viser spinner når lagrePending", () => {
    render(<TrygdeavgiftsperioderTabell perioder={[]} lagrePending={true} />);
    expect(screen.getByText("Laster...")).toBeDefined();
  });

  it("viser * for 25%-regel", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-12-31", {
        avgiftssats: null,
        avgiftPerMd: 3448,
        beregningsregel: "TJUEFEM_PROSENT_REGEL",
      }),
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.getByText("*")).toBeDefined();
  });

  it("viser ** fotnote for minstebeløp når det er blanding av beregningsregler", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-06-30", {
        avgiftssats: null,
        avgiftPerMd: 0,
        beregningsregel: "MINSTEBELØP",
      }),
      lagPeriode("2024-07-01", "2024-12-31", {
        avgiftssats: 6.8,
        beregningsregel: "ORDINÆR",
      }),
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.getByText("**")).toBeDefined();
  });

  it("viser tallverdi for ordinær beregningsregel", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-12-31", {
        avgiftssats: 6.8,
        beregningsregel: "ORDINÆR",
      }),
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.getByText("6.8")).toBeDefined();
  });

  it("viser fotnoter kun når relevante beregningsregler finnes", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-06-30", {
        avgiftssats: null,
        beregningsregel: "MINSTEBELØP",
      }),
      lagPeriode("2024-07-01", "2024-12-31", {
        avgiftssats: null,
        beregningsregel: "TJUEFEM_PROSENT_REGEL",
      }),
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.getByText("* Beregnet etter 25 %-regelen")).toBeDefined();
    expect(screen.getByText("** Inntekten er under minstebeløpet")).toBeDefined();
  });

  it("viser ingen fotnoter for kun ordinære perioder", () => {
    const perioder = [lagPeriode("2024-01-01", "2024-12-31")];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.queryByText(/Beregnet etter 25 %-regelen/)).toBeNull();
    expect(screen.queryByText(/Inntekten er under minstebeløpet/)).toBeNull();
  });

  it("viser *** for sammenslåtte inntektskilder", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-12-31", {
        avgiftssats: null,
        beregningsregel: "TJUEFEM_PROSENT_REGEL",
        harSammenslåtteInntektskilder: true,
      }),
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.getByText("***")).toBeDefined();
    expect(screen.queryByText("LØNN")).toBeNull();
  });

  it("viser *** fotnote når sammenslåtte inntektskilder finnes", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-12-31", {
        harSammenslåtteInntektskilder: true,
      }),
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.getByText("*** Mer enn en inntekt")).toBeDefined();
  });

  it("viser ingen *** fotnote når ingen sammenslåtte inntektskilder", () => {
    const perioder = [lagPeriode("2024-01-01", "2024-12-31")];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.queryByText(/Mer enn en inntekt/)).toBeNull();
  });

  it("viser Helsedel når avgiftsdel er HELSE", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-12-31", {
        avgiftssats: null,
        beregningsregel: "TJUEFEM_PROSENT_REGEL",
        avgiftsdel: "HELSE",
      }),
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.getByText("Helsedel")).toBeDefined();
  });

  it("viser Pensjonsdel når avgiftsdel er PENSJON", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-12-31", {
        avgiftssats: null,
        beregningsregel: "TJUEFEM_PROSENT_REGEL",
        avgiftsdel: "PENSJON",
      }),
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.getByText("Pensjonsdel")).toBeDefined();
  });

  it("viser infomelding i stedet for tabell når alle perioder er MINSTEBELØP", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-06-30", { avgiftssats: null, avgiftPerMd: 0, beregningsregel: "MINSTEBELØP" }),
      lagPeriode("2024-07-01", "2024-12-31", { avgiftssats: null, avgiftPerMd: 0, beregningsregel: "MINSTEBELØP" }),
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.getByText("Trygdeavgift skal ikke betales da inntekten er under minstebeløpet.")).toBeDefined();
    expect(screen.queryByText("Trygdeperiode")).toBeNull();
  });

  it("viser tabell (ikke infomelding) når kun noen perioder er MINSTEBELØP", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-06-30", { avgiftssats: null, avgiftPerMd: 0, beregningsregel: "MINSTEBELØP" }),
      lagPeriode("2024-07-01", "2024-12-31", { avgiftssats: 6.8, beregningsregel: "ORDINÆR" }),
    ];
    render(<TrygdeavgiftsperioderTabell perioder={perioder} lagrePending={false} />);
    expect(screen.queryByText("Trygdeavgift skal ikke betales da inntekten er under minstebeløpet.")).toBeNull();
    expect(screen.getByText("Trygdeperiode")).toBeDefined();
  });

  it("viser ingen infomelding når ingen perioder", () => {
    render(<TrygdeavgiftsperioderTabell perioder={[]} lagrePending={false} />);
    expect(screen.queryByText("Trygdeavgift skal ikke betales da inntekten er under minstebeløpet.")).toBeNull();
  });
});

const lagForklaring = (): Beregningsforklaring => ({
  aar: 2025,
  regelgruppe: "SAMLET",
  valgtRegel: "TJUEFEM_PROSENT_REGEL",
  aarsak: "BEREGNET",
  inntektsgrunnlag: [
    {
      inntektskilde: "INNTEKT_FRA_UTLANDET",
      fom: "2025-01-01",
      tom: "2025-12-31",
      maanedsbeloep: 9167,
      antallMaaneder: 12,
      sumBeloep: 110000,
    },
  ],
  ekskluderteInntekter: [],
  sumAarligInntekt: 110000,
  minstebeloep: 99650,
  inntektOverMinstebeloep: 10350,
  maksimalAvgift25Prosent: 2587,
  ordinaerAvgift: 8470,
  fastsattAvgift: 2587,
});

describe("TrygdeavgiftsperioderTabell · beregningsforklaring", () => {
  const periode25 = lagPeriode("2025-01-01", "2025-12-31", {
    avgiftssats: null,
    avgiftPerMd: 215,
    beregningsregel: "TJUEFEM_PROSENT_REGEL",
  });

  it("viser ikke beregningsforklaring-kortet når toggle er av", () => {
    mockUseFeatureToggle.mockReturnValue(false);
    render(
      <TrygdeavgiftsperioderTabell
        perioder={[periode25]}
        lagrePending={false}
        beregningsforklaringer={[lagForklaring()]}
      />,
    );
    expect(screen.queryByText("Beregningsforklaring")).toBeNull();
    // Tabellen er uendret: `*`-symbolet vises som ren tekst (ingen knapp)
    expect(screen.getByText("*")).toBeDefined();
    expect(screen.queryByRole("button", { name: "*" })).toBeNull();
  });

  it("viser ikke beregningsforklaring-kortet når forklaringer er tom", () => {
    mockUseFeatureToggle.mockReturnValue(true);
    render(<TrygdeavgiftsperioderTabell perioder={[periode25]} lagrePending={false} beregningsforklaringer={[]} />);
    expect(screen.queryByText("Beregningsforklaring")).toBeNull();
  });

  it("viser ikke beregningsforklaring-kortet når forklaringer er undefined", () => {
    mockUseFeatureToggle.mockReturnValue(true);
    render(<TrygdeavgiftsperioderTabell perioder={[periode25]} lagrePending={false} />);
    expect(screen.queryByText("Beregningsforklaring")).toBeNull();
  });

  it("viser kortet og klikkbart `*` når toggle er på og forklaringer finnes", () => {
    mockUseFeatureToggle.mockReturnValue(true);
    render(
      <TrygdeavgiftsperioderTabell
        perioder={[periode25]}
        lagrePending={false}
        beregningsforklaringer={[lagForklaring()]}
      />,
    );
    expect(screen.getByText("Beregningsforklaring")).toBeDefined();
    // `*` er nå en knapp med Hvorfor-tooltip
    const symbol = screen.getByRole("button", { name: "*" });
    expect(symbol).toBeDefined();
    // Hvorfor-lenken finnes i fotnoten
    expect(screen.getByRole("button", { name: "Hvorfor? →" })).toBeDefined();
  });
});
