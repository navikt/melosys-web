import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { VurderingAarsavregningInngang } from "./vurderingAarsavregningInngang";
import { renderWithProvidersAsync } from "../../../../ducks/test-utils/renderWithProviders";
import * as Api from "../../../../services/api";

vi.mock("../../../../services/api", () => ({
  Aarsavregning: {
    hentFiltrertAarsavregningList: vi.fn(),
    hentAarsavregning: vi.fn(),
    lagAarsavregning: vi.fn(),
    oppdaterHarInnbetaltTrygdeavgift: vi.fn(),
  },
  Fagsaker: {
    sok: {
      send: vi.fn(),
    },
  },
}));

const BEHANDLING_ID = 12345;
const SAKSNUMMER = "SAK123456";

const lagAarsavregningResponse = (overrides = {}) => ({
  aarsavregningID: 1,
  aar: 2024,
  harInnbetaltTrygdeavgift: null,
  avregning: {
    innbetaltTrygdeavgift: null,
    manueltAvgiftBeloep: null,
    beregnetAvgiftBelop: 1000,
    tidligereFakturertBeloep: null,
  },
  nyttTrygdeavgiftsGrunnlag: null,
  tidligereTrygdeavgiftsGrunnlagsopplysninger: null,
  ...overrides,
});

const lagAarsavregningMedGrunnlag = (overrides = {}) =>
  lagAarsavregningResponse({
    harInnbetaltTrygdeavgift: true,
    tidligereTrygdeavgiftsGrunnlagsopplysninger: {
      trygdeavgiftsgrunnlag: {
        avgiftspliktigperioder: [{ fom: "2024-01-01", tom: "2024-12-31" }],
        skatteforholdsperioder: [],
        inntektskperioder: [],
      },
      avgift: { trygdeavgiftsperioder: [], totalInntekt: 500000, totalAvgift: 27000 },
      tidligereInnbetaltTrygdeavgift: null,
    },
    ...overrides,
  });

const lagState = ({
  redigerbart = true,
  sakstema = "MEDLEMSKAP_LOVVALG",
  behandlingstema = "ARBEID_TJENESTEPERSON_ELLER_FLY",
  toggles = { "melosys.arsavregning.eos_pensjonist": true },
}: {
  redigerbart?: boolean;
  sakstema?: string;
  behandlingstema?: string;
  toggles?: Record<string, boolean>;
}) => ({
  behandlinger: {
    status: "OK",
    data: {
      behandlingID: BEHANDLING_ID,
      redigerbart,
      oppsummering: {
        behandlingstema: { kode: behandlingstema },
      },
    },
  },
  fagsaker: {
    status: "OK",
    data: {
      saksnummer: SAKSNUMMER,
      sakstype: { kode: "EU_EOS" },
      sakstema: { kode: sakstema },
    },
  },
  featureToggle: {
    status: "OK",
    data: toggles,
  },
  aarsavregning: {
    status: "OK",
    data: {},
  },
});

const defaultProps = {
  bekreft: vi.fn(),
  oppdaterStatus: vi.fn(),
  aktivtSteg: true,
};

const MELDING = "Melosys støtter ikke årsavregning for denne kombinasjonen av sakstype/-tema";
const MEDGRUNNLAG_MARKOER = "Årsavregning med grunnlag må ha grunnlag";

describe("VurderingAarsavregningInngang — ustøttet EØS-sakstype (MELOSYS-8163)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Api.Aarsavregning.hentFiltrertAarsavregningList).mockResolvedValue([
      { behandlingID: BEHANDLING_ID, aar: 2024, resultattype: { kode: "IKKE_FASTSATT" } },
    ] as any);
    vi.mocked(Api.Aarsavregning.hentAarsavregning).mockResolvedValue(lagAarsavregningResponse() as any);
    vi.mocked(Api.Aarsavregning.oppdaterHarInnbetaltTrygdeavgift).mockResolvedValue({
      harInnbetaltTrygdeavgift: true,
    } as any);
    vi.mocked(Api.Fagsaker.sok.send).mockResolvedValue([{ behandlingOversikter: [] }] as any);
  });

  it("viser ikke meldingen når steget ikke er aktivt, så testid-en er unik i flyten", async () => {
    await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} aktivtSteg={false} />, {
      preloadedState: lagState({}) as any,
    });

    expect(screen.queryByTestId("aarsavregning-ikke-stottet-sakstype")).not.toBeInTheDocument();
  });

  it("blokkerer ikke et støttet behandlingstema", async () => {
    await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
      preloadedState: lagState({ behandlingstema: "YRKESAKTIV" }) as any,
    });

    expect(screen.queryByText(MELDING)).not.toBeInTheDocument();
  });

  /*
   * Hele tilstandsrommet for blokkeringen: sakstype (blokkert/støttet) × redigerbart (saksbehandling/innsyn).
   * Se tabellen i vurderingAarsavregningInngang.tsx.
   */
  describe.each([
    { navn: "blokkert sakstype, saksbehandling", blokkert: true, redigerbart: true },
    { navn: "blokkert sakstype, innsyn", blokkert: true, redigerbart: false },
    { navn: "støttet sakstype, saksbehandling", blokkert: false, redigerbart: true },
    { navn: "støttet sakstype, innsyn", blokkert: false, redigerbart: false },
  ])("$navn", ({ blokkert, redigerbart }) => {
    const state = () =>
      lagState({
        redigerbart,
        toggles: blokkert
          ? { "melosys.arsavregning.eos_pensjonist": true }
          : {
              "melosys.arsavregning.eos_pensjonist": true,
              "melosys.arsavregning.eos_tjenesteperson": true,
            },
      });

    it(`viser meldingen: ${blokkert}`, async () => {
      await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
        preloadedState: state() as any,
      });

      if (blokkert) {
        expect(screen.getByText(MELDING)).toBeInTheDocument();
      } else {
        expect(screen.queryByText(MELDING)).not.toBeInTheDocument();
      }
    });

    it(`deaktiverer årsvelgeren: ${blokkert}`, async () => {
      const { container } = await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
        preloadedState: state() as any,
      });

      expect((container.querySelector("#aarVelger") as HTMLSelectElement).disabled).toBe(blokkert);
      // Støttet sakstype i innsyn skal fortsatt være readOnly, som før.
      // For en blokkert sakstype vinner disabled: ds-react dropper readOnly når disabled er satt.
      expect(container.querySelector(".navds-select--readonly") !== null).toBe(!redigerbart && !blokkert);
    });

    it(`skriver harInnbetaltTrygdeavgift til backend: ${!blokkert}`, async () => {
      await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
        preloadedState: state() as any,
      });

      if (blokkert) {
        expect(Api.Aarsavregning.oppdaterHarInnbetaltTrygdeavgift).not.toHaveBeenCalled();
      } else {
        expect(Api.Aarsavregning.oppdaterHarInnbetaltTrygdeavgift).toHaveBeenCalledWith(BEHANDLING_ID, {
          harInnbetaltTrygdeavgift: true,
        });
      }
    });

    const blokkererSaksbehandling = blokkert && redigerbart;

    it(`viser deaktivert «Bekreft og fortsett» uten skjema: ${blokkererSaksbehandling}`, async () => {
      // Med tidligere grunnlag rendres radiogruppa når flyten ikke er blokkert
      vi.mocked(Api.Aarsavregning.hentAarsavregning).mockResolvedValue(lagAarsavregningMedGrunnlag() as any);

      const { container } = await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
        preloadedState: state() as any,
      });

      if (blokkererSaksbehandling) {
        expect(screen.getByRole("button", { name: "Bekreft og fortsett" })).toBeDisabled();
        expect(container.querySelector(".innbetaltTrygdeavgiftRadioGroup")).not.toBeInTheDocument();
      } else {
        // Kun skjemaets egen knapp — blokkeringen legger ikke til en ekstra
        expect(screen.getAllByRole("button", { name: "Bekreft og fortsett" })).toHaveLength(1);
        expect(container.querySelector(".innbetaltTrygdeavgiftRadioGroup")).toBeInTheDocument();
      }
    });

    it(`monterer avgiftsskjemaet for tidligere grunnlag: ${!blokkererSaksbehandling}`, async () => {
      // Forelderen får grunnlag, barnet en tynn respons: da rendrer barnet en feilmelding
      // som er en direkte markør på at det faktisk ble montert.
      vi.mocked(Api.Aarsavregning.hentAarsavregning)
        .mockResolvedValueOnce(lagAarsavregningMedGrunnlag({ harInnbetaltTrygdeavgift: false }) as any)
        .mockResolvedValue(lagAarsavregningResponse({ tidligereTrygdeavgiftsGrunnlagsopplysninger: null }) as any);

      await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
        preloadedState: state() as any,
      });

      if (blokkererSaksbehandling) {
        expect(screen.queryByText(MEDGRUNNLAG_MARKOER)).not.toBeInTheDocument();
      } else {
        expect(screen.getByText(MEDGRUNNLAG_MARKOER)).toBeInTheDocument();
      }
    });
  });
});
