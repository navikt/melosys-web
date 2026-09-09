import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import MKV from "../../../melosyskodeverk";
import { STATUS } from "../../../services";
import { MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER } from "../../../featuretoggle/toggleNavn";
import { VurderingTrygdeavgift } from "./vurderingTrygdeavgift";
import * as Api from "../../../services/api";
import { useFeatureToggle } from "../../../featuretoggle";
import TrygdeavgiftsperioderTabell from "../../../felleskomponenter/trygdeavgift/komponenter/trygdeavgiftsperioderTabell";

vi.mock("../../../services/api", () => ({
  Trygdeavgift: {
    hentBeregnetTrygdeavgiftEosPensjonist: vi.fn(),
    eøsPensjonistBeregnTrygdeavgiftsperioder: vi.fn(),
    hentOpprinneligTrygdeavgiftsgrunnlag: vi.fn(),
  },
}));

vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));

vi.mock("../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder", () => ({
  Skatteforholdsperioder: () => <div data-testid="skatteforholdsperioder">Skatteforholdsperioder</div>,
}));

vi.mock("../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder", () => ({
  Inntektskilder: () => <div data-testid="inntektskilder">Inntektskilder</div>,
}));

vi.mock("../../../felleskomponenter/trygdeavgift/komponenter/trygdeavgiftsperioderTabell", () => ({
  default: vi.fn(() => <div data-testid="trygdeavgiftstabell">TrygdeavgiftsperioderTabell</div>),
}));

const createMockBeregnetTrygdeavgift = (overrides = {}) => ({
  trygdeavgiftsperioder: [],
  trygdeavgiftsgrunnlag: {
    skatteforholdsperioder: [],
    inntektskilder: [],
  },
  ...overrides,
});

interface CreateStateOptions {
  behandlingstype?: string;
  redigerbart?: boolean;
  sakstype?: string;
  behandlingstema?: string;
  helseutgiftDekkesPeriode?: { fomDato: string; tomDato: string };
}

const createState = ({
  behandlingstype = MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
  redigerbart = true,
  sakstype = MKV.Koder.sakstyper.EU_EOS,
  behandlingstema = MKV.Koder.behandlinger.behandlingstema.PENSJONIST,
  helseutgiftDekkesPeriode = { fomDato: "2024-01-01", tomDato: "2024-12-31" },
}: CreateStateOptions = {}) => ({
  behandlinger: {
    status: STATUS.OK,
    data: {
      behandlingID: 1,
      redigerbart,
      oppsummering: {
        behandlingstype: { kode: behandlingstype },
        behandlingstema: { kode: behandlingstema },
      },
    },
  },
  fagsaker: {
    status: STATUS.OK,
    data: {
      sakstype: { kode: sakstype },
    },
  },
  helseutgiftdekkesperiode: {
    status: STATUS.OK,
    data: helseutgiftDekkesPeriode,
  },
});

const defaultProps = {
  bekreft: vi.fn(),
  tilbake: vi.fn(),
  aktivtSteg: true,
  oppdaterStatus: vi.fn(),
};

const renderComponent = (stateOverrides: CreateStateOptions = {}, propsOverrides: Partial<typeof defaultProps> = {}) =>
  renderWithProviders(<VurderingTrygdeavgift {...defaultProps} {...propsOverrides} />, {
    preloadedState: createState(stateOverrides),
  });

describe("VurderingTrygdeavgift (helseutgiftDekkesPeriode / EØS Pensjonist)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockImplementation(
      (toggle) => toggle === MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER,
    );
    vi.mocked(Api.Trygdeavgift.hentBeregnetTrygdeavgiftEosPensjonist).mockResolvedValue(
      createMockBeregnetTrygdeavgift() as any,
    );
    vi.mocked(Api.Trygdeavgift.hentOpprinneligTrygdeavgiftsgrunnlag).mockResolvedValue({
      skatteforholdsperioder: [],
      inntektskilder: [],
    });
    vi.mocked(Api.Trygdeavgift.eøsPensjonistBeregnTrygdeavgiftsperioder).mockResolvedValue(
      createMockBeregnetTrygdeavgift() as any,
    );
  });

  describe("rendering", () => {
    it("rendrer ingenting når steget ikke er aktivt", () => {
      const { container } = renderComponent({}, { aktivtSteg: false });
      expect(container.firstChild).toBeNull();
    });

    it("viser heading når steget er aktivt", async () => {
      renderComponent();
      expect(screen.getByRole("heading", { name: "Trygdeavgift" })).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgiftEosPensjonist).toHaveBeenCalledWith(1);
      });
    });
  });

  describe("25%-regel og minstebeløp — dataflyt til TrygdeavgiftsperioderTabell", () => {
    const mockPerioderMedBeregningsregel = (perioder: any[]) => {
      vi.mocked(Api.Trygdeavgift.hentBeregnetTrygdeavgiftEosPensjonist).mockResolvedValue(
        createMockBeregnetTrygdeavgift({
          trygdeavgiftsperioder: perioder,
          trygdeavgiftsgrunnlag: {
            skatteforholdsperioder: [
              { fomDato: "2024-01-01", tomDato: "2024-12-31", skatteplikttype: "IKKE_SKATTEPLIKTIG" },
            ],
            inntektskilder: [
              {
                type: "PENSJON",
                arbeidsgiversavgiftBetales: false,
                avgiftspliktigInntekt: 9000,
                fomDato: "2024-01-01",
                tomDato: "2024-12-31",
                erMaanedsbelop: true,
              },
            ],
          },
        }) as any,
      );
    };

    const hentTabellProps = () => {
      const calls = vi.mocked(TrygdeavgiftsperioderTabell).mock.calls;
      const sisteKall = calls[calls.length - 1];
      return sisteKall?.[0];
    };

    it("sender perioder med beregningsregel TJUEFEM_PROSENT_REGEL til tabellen (AC2)", async () => {
      mockPerioderMedBeregningsregel([
        {
          fom: "2024-01-01",
          tom: "2024-12-31",
          avgiftssats: null,
          avgiftPerMd: 2087,
          beregningsregel: "TJUEFEM_PROSENT_REGEL",
        },
      ]);

      renderComponent();

      await waitFor(() => {
        const props = hentTabellProps();
        expect(props?.perioder).toBeDefined();
        expect(props!.perioder![0].beregningsregel).toBe("TJUEFEM_PROSENT_REGEL");
      });
    });

    it("sender perioder med beregningsregel MINSTEBELØP til tabellen (AC1)", async () => {
      mockPerioderMedBeregningsregel([
        {
          fom: "2024-01-01",
          tom: "2024-12-31",
          avgiftssats: null,
          avgiftPerMd: 0,
          beregningsregel: "MINSTEBELØP",
        },
      ]);

      renderComponent();

      await waitFor(() => {
        const props = hentTabellProps();
        expect(props?.perioder).toBeDefined();
        expect(props!.perioder![0].beregningsregel).toBe("MINSTEBELØP");
      });
    });

    it("viser 'Foreløpig beregnet trygdeavgift'-seksjonen når alle perioder er MINSTEBELØP med 0 i avgift", async () => {
      mockPerioderMedBeregningsregel([
        { fom: "2024-01-01", tom: "2024-12-31", avgiftssats: null, avgiftPerMd: 0, beregningsregel: "MINSTEBELØP" },
      ]);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Foreløpig beregnet trygdeavgift/ })).toBeInTheDocument();
      });
    });

    it("skjuler 'Foreløpig beregnet trygdeavgift'-seksjonen når alle ordinære perioder har 0 i avgift", async () => {
      mockPerioderMedBeregningsregel([
        { fom: "2024-01-01", tom: "2024-12-31", avgiftssats: 0, avgiftPerMd: 0, beregningsregel: "ORDINÆR" },
      ]);

      renderComponent();

      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgiftEosPensjonist).toHaveBeenCalled();
      });
      expect(screen.queryByRole("heading", { name: /Foreløpig beregnet trygdeavgift/ })).not.toBeInTheDocument();
    });

    it("sender perioder med harSammenslåtteInntektskilder til tabellen (AC4)", async () => {
      mockPerioderMedBeregningsregel([
        {
          fom: "2024-01-01",
          tom: "2024-12-31",
          avgiftssats: null,
          avgiftPerMd: 2087,
          beregningsregel: "TJUEFEM_PROSENT_REGEL",
          harSammenslåtteInntektskilder: true,
        },
      ]);

      renderComponent();

      await waitFor(() => {
        const props = hentTabellProps();
        expect(props?.perioder).toBeDefined();
        expect(props!.perioder![0].harSammenslåtteInntektskilder).toBe(true);
      });
    });

    it("sender erEøsPensjonist=true til tabellen", async () => {
      mockPerioderMedBeregningsregel([
        {
          fom: "2024-01-01",
          tom: "2024-12-31",
          avgiftssats: 5.1,
          avgiftPerMd: 10200,
          beregningsregel: "ORDINÆR",
        },
      ]);

      renderComponent();

      await waitFor(() => {
        const props = hentTabellProps();
        expect(props?.erEøsPensjonist).toBe(true);
      });
    });
  });
});
