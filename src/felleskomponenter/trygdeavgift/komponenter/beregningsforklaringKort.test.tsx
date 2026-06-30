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

import { BeregningsforklaringKort } from "./beregningsforklaringKort";
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
  ordinaerAvgiftPoster: [
    {
      inntektskilde: "INNTEKT_FRA_UTLANDET",
      grunnlag: 110000,
      sats: 7.7,
      beloep: 8470,
    },
  ],
  fastsattAvgift: 2587,
  fastsattAvgiftPerMaaned: 215,
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
  ordinaerAvgift: 3080,
  ordinaerAvgiftPoster: [
    {
      inntektskilde: "INNTEKT_FRA_UTLANDET",
      grunnlag: 40000,
      sats: 7.7,
      beloep: 3080,
    },
  ],
  fastsattAvgift: 0,
  fastsattAvgiftPerMaaned: 0,
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

const lagForklaringAllInntektSkattepliktig = (): Beregningsforklaring => ({
  aar: 2024,
  regelgruppe: "SAMLET",
  valgtRegel: "ORDINÆR",
  aarsak: "INGEN_INNTEKT",
  inntektsgrunnlag: [],
  ekskluderteInntekter: [
    {
      inntektskilde: "NÆRINGSINNTEKT_FRA_NORGE",
      fom: "2024-01-01",
      tom: "2024-12-31",
      sumBeloep: 240000,
      aarsak: "SKATTEETATEN_FASTSETTER",
    },
  ],
  sumAarligInntekt: 0,
  minstebeloep: 69650,
  inntektOverMinstebeloep: null,
  maksimalAvgift25Prosent: null,
  ordinaerAvgift: 0,
  ordinaerAvgiftPoster: [],
  fastsattAvgift: 0,
  fastsattAvgiftPerMaaned: 0,
});

const noop = () => undefined;

describe("BeregningsforklaringKort", () => {
  it("returnerer null når det ikke finnes forklaringer", () => {
    const { container } = render(
      <BeregningsforklaringKort forklaringer={[]} open={false} onToggle={noop} scrollTilFelt={null} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("rendrer alle tre steg for 25 %-regel-scenario", () => {
    render(
      <BeregningsforklaringKort forklaringer={[lag25ProsentForklaring()]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(screen.getByText("Beregningsforklaring")).toBeDefined();
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

  it("viser utregningen av ordinær avgift (ikke bare summen) i steg 3", () => {
    render(
      <BeregningsforklaringKort forklaringer={[lag25ProsentForklaring()]} open onToggle={noop} scrollTilFelt={null} />,
    );
    // Utregningslinjen: grunnlag × sats med prosent formatert norsk
    expect(screen.getByText(/7,7 %/)).toBeDefined();
    // Eksplisitt "Ordinær avgift"-underseksjon + sumrad
    expect(screen.getByText("Ordinær avgift")).toBeDefined();
    expect(screen.getByText(/Sum ordinær avgift/)).toBeDefined();
  });

  it("viser månedlig fastsatt avgift på resultatlinjen", () => {
    render(
      <BeregningsforklaringKort forklaringer={[lag25ProsentForklaring()]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(screen.getByText(/215 kr per måned/)).toBeDefined();
  });

  it("viser ikke månedlig avgift når fastsatt avgift er 0", () => {
    render(
      <BeregningsforklaringKort
        forklaringer={[lagForklaringAllInntektSkattepliktig()]}
        open
        onToggle={noop}
        scrollTilFelt={null}
      />,
    );
    expect(screen.queryByText(/per måned/)).toBeNull();
  });

  it("viser ikke steg 3 og merker under minstebeløp for minstebeløp-scenario", () => {
    render(
      <BeregningsforklaringKort
        forklaringer={[lagMinstebeloepForklaring()]}
        open
        onToggle={noop}
        scrollTilFelt={null}
      />,
    );
    expect(screen.getByText(/Sjekk mot minstebeløpet/)).toBeDefined();
    // Steg 3 skal ikke vises når maksimalAvgift25Prosent er null
    expect(screen.queryByText(/25 %-regelen \(maksgrense\)/)).toBeNull();
    expect(screen.getByText(/inntekten er under minstebeløpet/)).toBeDefined();
  });

  it("viser info om ekskludert inntekt når ekskluderteInntekter finnes", () => {
    render(
      <BeregningsforklaringKort
        forklaringer={[lagForklaringMedEkskludert()]}
        open
        onToggle={noop}
        scrollTilFelt={null}
      />,
    );
    expect(screen.getByText(/Skatteetaten fastsetter avgiften holdes utenfor/)).toBeDefined();
    expect(screen.getByText("ARBEIDSINNTEKT_FRA_NORGE")).toBeDefined();
  });

  it("skjuler minstebeløp-sjekken når all inntekt er skattepliktig (ingen inntekt i vurderingen)", () => {
    render(
      <BeregningsforklaringKort
        forklaringer={[lagForklaringAllInntektSkattepliktig()]}
        open
        onToggle={noop}
        scrollTilFelt={null}
      />,
    );
    // Inntektsposten vises fortsatt (ekskludert), men minstebeløp-sjekken er utelatt
    expect(screen.getByText("NÆRINGSINNTEKT_FRA_NORGE")).toBeDefined();
    expect(screen.queryByText(/Sjekk mot minstebeløpet/)).toBeNull();
    expect(screen.queryByText(/Minstebeløpet avkortes ikke/)).toBeNull();
    expect(screen.getByText(/Skatteetaten fastsetter avgiften holdes utenfor/)).toBeDefined();
  });

  it("merker minstebeløpet avkortes ikke", () => {
    render(
      <BeregningsforklaringKort forklaringer={[lag25ProsentForklaring()]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(screen.getByText(/Minstebeløpet avkortes ikke/)).toBeDefined();
  });

  it("viser desimalt antall måneder på norsk format (f.eks. 50000 × 1,97 mnd = 98500)", () => {
    const forklaring: Beregningsforklaring = {
      ...lag25ProsentForklaring(),
      inntektsgrunnlag: [
        {
          inntektskilde: "INNTEKT_FRA_UTLANDET",
          fom: "2025-01-01",
          tom: "2025-02-28",
          maanedsbeloep: 50000,
          antallMaaneder: 1.97,
          sumBeloep: 98500,
        },
      ],
    };
    render(<BeregningsforklaringKort forklaringer={[forklaring]} open onToggle={noop} scrollTilFelt={null} />);
    // Desimalen rundes ikke til heltall, og vises med norsk desimalkomma.
    expect(screen.getByText(/50000 kr × 1,97 mnd =/)).toBeDefined();
  });
});
