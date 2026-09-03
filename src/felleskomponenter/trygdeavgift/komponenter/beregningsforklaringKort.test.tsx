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
  inntektsgruppe: "SAMLET",
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
  inntektsgruppe: "SAMLET",
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
  inntektsgruppe: "SAMLET",
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

// Frivillig medlemskap: helsedel og pensjonsdel måles hver for seg mot ett felles tak.
// Ingen av dem overstiger taket, men summen (339600) gjør det.
const lagForklaringMedAvgiftPerDel = (): Beregningsforklaring => ({
  aar: 2025,
  inntektsgruppe: "SAMLET",
  valgtRegel: "ORDINÆR",
  aarsak: "BEREGNET",
  inntektsgrunnlag: [
    {
      inntektskilde: "INNTEKT_FRA_UTLANDET",
      fom: "2025-01-01",
      tom: "2025-12-31",
      maanedsbeloep: 100000,
      antallMaaneder: 12,
      sumBeloep: 1200000,
    },
  ],
  ekskluderteInntekter: [],
  sumAarligInntekt: 1200000,
  minstebeloep: 99650,
  inntektOverMinstebeloep: 1100350,
  maksimalAvgift25Prosent: 275087,
  ordinaerAvgift: 339600,
  ordinaerAvgiftPoster: [],
  ordinaerAvgiftPerDel: [
    { inntektsgruppe: "HELSEDEL", ordinaerAvgift: 81600 },
    { inntektsgruppe: "PENSJONSDEL", ordinaerAvgift: 258000 },
  ],
  fastsattAvgift: 339600,
  fastsattAvgiftPerMaaned: 28300,
});

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
    expect(screen.getByText(/Samlet inntekt/)).toBeDefined();
    // 2587 kr er både 25 %-taket og fastsatt avgift, og finnes derfor flere steder.
    expect(screen.getAllByText("2587 kr").length).toBeGreaterThan(0);
    expect(screen.getByText(/inntekten er over minstebeløpet/)).toBeDefined();
  });

  it("viser utregningen av ordinær avgift (ikke bare summen) i steg 3", () => {
    render(
      <BeregningsforklaringKort forklaringer={[lag25ProsentForklaring()]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(screen.getByText(/7,7 %/)).toBeDefined();
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
    expect(screen.getByText(/50000 kr × 1,97 mnd =/)).toBeDefined();
  });

  it("viser hvert delbeløp mot taket når taket ble vurdert per avgiftsdel", () => {
    const { container } = render(
      <BeregningsforklaringKort
        forklaringer={[lagForklaringMedAvgiftPerDel()]}
        open
        onToggle={noop}
        scrollTilFelt={null}
      />,
    );
    expect(screen.getByText(/Hver avgiftsdel målt mot taket/)).toBeDefined();
    expect(container.textContent).toContain("81600 kr ≤ 275087 kr");
    expect(container.textContent).toContain("258000 kr ≤ 275087 kr");
    expect(screen.getByText(/ingen av dem overstiger 275087 kr/)).toBeDefined();
    // Summen 339600 er større enn taket 275087, og skal ikke fremstilles som under det.
    expect(screen.queryByText(/Ordinær avgift 339600 kr ≤/)).toBeNull();
  });

  it("påstår ikke at ingen del overstiger taket når et delbeløp faktisk gjør det", () => {
    const delOverTaket: Beregningsforklaring = {
      ...lagForklaringMedAvgiftPerDel(),
      ordinaerAvgiftPerDel: [
        { inntektsgruppe: "HELSEDEL", ordinaerAvgift: 39600 },
        { inntektsgruppe: "PENSJONSDEL", ordinaerAvgift: 300000 },
      ],
    };
    const { container } = render(
      <BeregningsforklaringKort forklaringer={[delOverTaket]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(container.textContent).toContain("300000 kr > 275087 kr");
    expect(screen.queryByText(/ingen av dem overstiger/)).toBeNull();
  });

  it("sier ikke at delbeløpene mangler når de nettopp ble vist over merknaden", () => {
    const delOverTaket: Beregningsforklaring = {
      ...lagForklaringMedAvgiftPerDel(),
      ordinaerAvgiftPerDel: [
        { inntektsgruppe: "HELSEDEL", ordinaerAvgift: 39600 },
        { inntektsgruppe: "PENSJONSDEL", ordinaerAvgift: 300000 },
      ],
    };
    const { container } = render(
      <BeregningsforklaringKort forklaringer={[delOverTaket]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(container.textContent).toContain("300000 kr > 275087 kr");
    expect(container.textContent).not.toContain("delbeløpene mangler");
    expect(container.textContent).toContain("Minst én avgiftsdel overstiger 25 %-taket 275087 kr");
  });

  it("navngir ikke en avgiftsdel som mangler når bare én del har avgift", () => {
    const kunHelsedel: Beregningsforklaring = {
      ...lagForklaringMedAvgiftPerDel(),
      ordinaerAvgift: 81600,
      ordinaerAvgiftPerDel: [{ inntektsgruppe: "HELSEDEL", ordinaerAvgift: 81600 }],
    };
    const { container } = render(
      <BeregningsforklaringKort forklaringer={[kunHelsedel]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(container.textContent).toContain("81600 kr ≤ 275087 kr");
    expect(container.textContent).not.toContain("Pensjonsdel");
    expect(screen.getByText(/ingen av dem overstiger 275087 kr/)).toBeDefined();
  });

  it("viser at avgiften ble begrenset når 25 %-regelen slo ut, også med delbeløp i svaret", () => {
    const begrenset: Beregningsforklaring = {
      ...lagForklaringMedAvgiftPerDel(),
      valgtRegel: "TJUEFEM_PROSENT_REGEL",
      fastsattAvgift: 275087,
    };
    const { container } = render(
      <BeregningsforklaringKort forklaringer={[begrenset]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(container.textContent).toContain("Avgiften begrenses til 275087 kr");
    expect(screen.queryByText(/ordinær beregning brukes/)).toBeNull();
  });

  it("hevder ikke at ordinær beregning ble valgt fordi summen er under taket, når backend ikke sender delbeløp", () => {
    const utenDeler: Beregningsforklaring = {
      ...lagForklaringMedAvgiftPerDel(),
      ordinaerAvgiftPerDel: undefined,
    };
    const { container } = render(
      <BeregningsforklaringKort forklaringer={[utenDeler]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(screen.queryByText(/Hver avgiftsdel målt mot taket/)).toBeNull();
    expect(container.textContent).toContain(
      "Ordinær avgift 339600 kr > 25 %-tak 275087 kr, men avgiften ble ikke begrenset. Taket ble målt mot hver " +
        "avgiftsdel for seg, og delbeløpene mangler i denne forklaringen.",
    );
  });

  it("skriver den enkle merknaden når summen faktisk er under taket", () => {
    const underTaket: Beregningsforklaring = {
      ...lagForklaringMedAvgiftPerDel(),
      ordinaerAvgift: 100000,
      ordinaerAvgiftPerDel: undefined,
    };
    const { container } = render(
      <BeregningsforklaringKort forklaringer={[underTaket]} open onToggle={noop} scrollTilFelt={null} />,
    );
    expect(container.textContent).toContain(
      "Ordinær avgift 100000 kr ≤ 25 %-tak 275087 kr → ordinær beregning brukes.",
    );
  });
});
