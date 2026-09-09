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

const lagAarsavregningMedGrunnlag = () =>
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

describe("VurderingAarsavregningInngang — ustøttet EØS-sakstype (MELOSYS-8163)", () => {
  beforeEach(() => {
    vi.mocked(Api.Aarsavregning.hentFiltrertAarsavregningList).mockResolvedValue([
      { behandlingID: BEHANDLING_ID, aar: 2024, resultattype: { kode: "IKKE_FASTSATT" } },
    ] as any);
    vi.mocked(Api.Aarsavregning.hentAarsavregning).mockResolvedValue(lagAarsavregningResponse() as any);
    vi.mocked(Api.Aarsavregning.oppdaterHarInnbetaltTrygdeavgift).mockResolvedValue({
      harInnbetaltTrygdeavgift: true,
    } as any);
    vi.mocked(Api.Fagsaker.sok.send).mockResolvedValue([{ behandlingOversikter: [] }] as any);
  });

  it("skriver ikke harInnbetaltTrygdeavgift til backend når sakstypen er blokkert", async () => {
    await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
      preloadedState: lagState({}) as any,
    });

    expect(Api.Aarsavregning.oppdaterHarInnbetaltTrygdeavgift).not.toHaveBeenCalled();
  });

  it("skriver harInnbetaltTrygdeavgift til backend når sakstypen er støttet", async () => {
    await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
      preloadedState: lagState({
        toggles: {
          "melosys.arsavregning.eos_pensjonist": true,
          "melosys.arsavregning.eos_tjenesteperson": true,
        },
      }) as any,
    });

    expect(Api.Aarsavregning.oppdaterHarInnbetaltTrygdeavgift).toHaveBeenCalledWith(BEHANDLING_ID, {
      harInnbetaltTrygdeavgift: true,
    });
  });

  it("deaktiverer årsvelgeren, slik at tastaturvalg ikke kan opprette en årsavregning", async () => {
    const { container } = await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
      preloadedState: lagState({}) as any,
    });

    const aarVelger = container.querySelector("#aarVelger") as HTMLSelectElement;
    expect(aarVelger).toBeTruthy();
    expect(aarVelger.disabled).toBe(true);
  });

  it("viser blokkerende melding og deaktivert «Bekreft og fortsett», og skjuler skjemaet", async () => {
    const { container } = await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
      preloadedState: lagState({}) as any,
    });

    expect(
      screen.getByText("Melosys støtter ikke årsavregning for denne kombinasjonen av sakstype/-tema"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bekreft og fortsett" })).toBeDisabled();
    expect(container.querySelector(".innbetaltTrygdeavgiftRadioGroup")).not.toBeInTheDocument();
  });

  it("skjuler skjemaet i blokkert flyt også når det finnes tidligere grunnlag", async () => {
    vi.mocked(Api.Aarsavregning.hentAarsavregning).mockResolvedValue(lagAarsavregningMedGrunnlag() as any);

    const { container } = await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
      preloadedState: lagState({}) as any,
    });

    expect(container.querySelector(".innbetaltTrygdeavgiftRadioGroup")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bekreft og fortsett" })).toBeDisabled();
  });

  it("blokkerer ikke innsyn: ingen ekstra melding eller knapp, og innholdet vises", async () => {
    vi.mocked(Api.Aarsavregning.hentAarsavregning).mockResolvedValue(lagAarsavregningMedGrunnlag() as any);

    const { container } = await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
      preloadedState: lagState({ redigerbart: false }) as any,
    });

    expect(
      screen.queryByText("Melosys støtter ikke årsavregning for denne kombinasjonen av sakstype/-tema"),
    ).not.toBeInTheDocument();
    // Kun skjemaets egen knapp skal finnes — blokkeringen legger ikke til en ekstra
    expect(screen.getAllByRole("button", { name: "Bekreft og fortsett" })).toHaveLength(1);
    expect(container.querySelector(".innbetaltTrygdeavgiftRadioGroup")).toBeInTheDocument();
  });

  it("blokkerer ikke en støttet sakstype", async () => {
    await renderWithProvidersAsync(<VurderingAarsavregningInngang {...defaultProps} />, {
      preloadedState: lagState({ behandlingstema: "YRKESAKTIV" }) as any,
    });

    expect(
      screen.queryByText("Melosys støtter ikke årsavregning for denne kombinasjonen av sakstype/-tema"),
    ).not.toBeInTheDocument();
  });
});
