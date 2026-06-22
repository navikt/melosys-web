import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../navFrontend", () => {
  const ExpansionCard: any = ({ children, open }: any) => <div data-open={open}>{children}</div>;
  ExpansionCard.Header = ({ children }: any) => <div>{children}</div>;
  ExpansionCard.Title = ({ children }: any) => <h3>{children}</h3>;
  ExpansionCard.Description = ({ children }: any) => <p>{children}</p>;
  ExpansionCard.Content = ({ children }: any) => <div>{children}</div>;
  return {
    ExpansionCard,
    Alert: ({ children }: any) => <div role="alert">{children}</div>,
    Tag: ({ children }: any) => <span>{children}</span>,
    BodyShort: ({ children, className }: any) => <span className={className}>{children}</span>,
    Detail: ({ children }: any) => <span>{children}</span>,
  };
});

vi.mock("../../../kodeverk", () => ({
  finnTermFraListe: (_liste: any, kode: string) => kode,
}));

vi.mock("../../../melosyskodeverk", () => ({
  default: { KTObjects: { inntektskildetype: [] } },
}));

vi.mock("../../../utils", () => ({
  formaterTilNorskBelopUtenDesimaler: (n: number) => String(n),
}));

import { Beregningsgrunnlag } from "./beregningsgrunnlag";
import { Beregningsforklaring } from "../../../services/modules/trygdeavgift";

const lag25ProsentForklaring = (): Beregningsforklaring => ({
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

const lagMinstebeloepForklaring = (): Beregningsforklaring => ({
  aar: 2025,
  regelgruppe: "SAMLET",
  valgtRegel: "MINSTEBELØP",
  aarsak: "INNTEKT_UNDER_MINSTEBELØP",
  inntektsgrunnlag: [
    {
      inntektskilde: "INNTEKT_FRA_UTLANDET",
      fom: "2025-01-01",
      tom: "2025-02-28",
      maanedsbeloep: 20000,
      antallMaaneder: 2,
      sumBeloep: 40000,
    },
  ],
  ekskluderteInntekter: [],
  sumAarligInntekt: 40000,
  minstebeloep: 99650,
  inntektOverMinstebeloep: null,
  maksimalAvgift25Prosent: null,
  ordinaerAvgift: 0,
  fastsattAvgift: 0,
});

const lagForklaringMedEkskludert = (): Beregningsforklaring => ({
  ...lag25ProsentForklaring(),
  ekskluderteInntekter: [
    {
      inntektskilde: "ARBEIDSINNTEKT_FRA_NORGE",
      fom: "2025-01-01",
      tom: "2025-06-30",
      sumBeloep: 102000,
      aarsak: "SKATTEETATEN_FASTSETTER",
    },
  ],
});

const noop = () => undefined;

describe("Beregningsgrunnlag", () => {
  it("returnerer null når det ikke finnes forklaringer", () => {
    const { container } = render(
      <Beregningsgrunnlag forklaringer={[]} open={false} onToggle={noop} scrollTilFelt={null} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("rendrer alle tre steg for 25 %-regel-scenario", () => {
    render(<Beregningsgrunnlag forklaringer={[lag25ProsentForklaring()]} open onToggle={noop} scrollTilFelt={null} />);
    expect(screen.getByText("Beregningsgrunnlag")).toBeDefined();
    expect(screen.getByText(/Inntekt som inngår i vurderingen/)).toBeDefined();
    expect(screen.getByText(/Sjekk mot minstebeløpet/)).toBeDefined();
    expect(screen.getByText(/25 %-regelen \(maksgrense\)/)).toBeDefined();
    // Regelgruppe oversatt til norsk
    expect(screen.getByText(/Samlet inntekt/)).toBeDefined();
    // Fastsatt avgift / 25 %-tak vises (beløpet forekommer flere steder)
    expect(screen.getAllByText("2587 kr").length).toBeGreaterThan(0);
    // Over minstebeløp → suksessmerknad om at avgift skal beregnes
    expect(screen.getByText(/inntekten er over minstebeløpet/)).toBeDefined();
  });

  it("viser ikke steg 3 og merker under minstebeløp for minstebeløp-scenario", () => {
    render(
      <Beregningsgrunnlag forklaringer={[lagMinstebeloepForklaring()]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(screen.getByText(/Sjekk mot minstebeløpet/)).toBeDefined();
    // Steg 3 skal ikke vises når maksimalAvgift25Prosent er null
    expect(screen.queryByText(/25 %-regelen \(maksgrense\)/)).toBeNull();
    expect(screen.getByText(/inntekten er under minstebeløpet/)).toBeDefined();
  });

  it("viser info om ekskludert inntekt når ekskluderteInntekter finnes", () => {
    render(
      <Beregningsgrunnlag forklaringer={[lagForklaringMedEkskludert()]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(screen.getByText(/Skatteetaten fastsetter avgiften holdes utenfor/)).toBeDefined();
    expect(screen.getByText("ARBEIDSINNTEKT_FRA_NORGE")).toBeDefined();
  });

  it("merker minstebeløpet avkortes ikke", () => {
    render(<Beregningsgrunnlag forklaringer={[lag25ProsentForklaring()]} open onToggle={noop} scrollTilFelt={null} />);
    expect(screen.getByText(/Minstebeløpet avkortes ikke/)).toBeDefined();
  });
});
