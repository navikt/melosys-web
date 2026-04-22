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
    hentBeregnetTrygdeavgift: vi.fn(),
    hentOpprinneligTrygdeavgiftsgrunnlag: vi.fn(),
    beregnTrygdeavgiftsperioder: vi.fn(),
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

// Minimal mock data - only what's needed
const createMockBeregnetTrygdeavgift = (overrides = {}) => ({
  trygdeavgiftsperioder: [],
  trygdeavgiftsgrunnlag: {
    skatteforholdsperioder: [],
    inntektskilder: [],
  },
  ...overrides,
});

const createMockMedlemskapsperiode = (overrides = {}) => ({
  id: 1,
  fomDato: "2024-01-01",
  tomDato: "2024-12-31",
  bestemmelse: "FTRL_2_2",
  innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
  trygdedekning: "FTRL_2_2",
  medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  ...overrides,
});

interface CreateStateOptions {
  behandlingstype?: string;
  redigerbart?: boolean;
  medlemskapsperioder?: any[];
  sakstype?: string;
  lovvalgsperioder?: any[];
}

const createState = ({
  behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
  redigerbart = true,
  medlemskapsperioder = [createMockMedlemskapsperiode()],
  sakstype = MKV.Koder.sakstyper.FTRL,
  lovvalgsperioder = [],
}: CreateStateOptions = {}) => ({
  behandlinger: {
    status: STATUS.OK,
    data: {
      behandlingID: 1,
      redigerbart,
      oppsummering: {
        behandlingstype: { kode: behandlingstype },
      },
    },
  },
  fagsaker: {
    status: STATUS.OK,
    data: {
      sakstype: { kode: sakstype },
    },
  },
  medlemskapsperioder: {
    status: STATUS.OK,
    data: {
      medlemskapsperioder,
    },
  },
  lovvalgsperioder: {
    status: STATUS.OK,
    data: lovvalgsperioder,
  },
});

const defaultProps = {
  bekreft: vi.fn(),
  tilbake: vi.fn(),
  aktivtSteg: true,
  oppdaterStatus: vi.fn(),
};

interface VurderingTrygdeavgiftProps {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

const renderComponent = (
  stateOverrides: CreateStateOptions = {},
  propsOverrides: Partial<VurderingTrygdeavgiftProps> = {},
) =>
  renderWithProviders(<VurderingTrygdeavgift {...defaultProps} {...propsOverrides} />, {
    preloadedState: createState(stateOverrides),
  });

describe("VurderingTrygdeavgift", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(false);
    vi.mocked(Api.Trygdeavgift.hentBeregnetTrygdeavgift).mockResolvedValue(createMockBeregnetTrygdeavgift() as any);
    vi.mocked(Api.Trygdeavgift.hentOpprinneligTrygdeavgiftsgrunnlag).mockResolvedValue({
      skatteforholdsperioder: [],
      inntektskilder: [],
    });
    vi.mocked(Api.Trygdeavgift.beregnTrygdeavgiftsperioder).mockResolvedValue(createMockBeregnetTrygdeavgift() as any);
  });

  describe("rendering", () => {
    it("rendrer ingenting når steget ikke er aktivt", async () => {
      const { container } = renderComponent({}, { aktivtSteg: false });

      expect(container.firstChild).toBeNull();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });

    it("viser heading når steget er aktivt", async () => {
      renderComponent();

      expect(screen.getByRole("heading", { name: "Trygdeavgift" })).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });

    it("viser info når medlemskapsperioden mangler sluttdato", async () => {
      renderComponent({
        medlemskapsperioder: [createMockMedlemskapsperiode({ tomDato: undefined })],
        redigerbart: false,
      });

      expect(
        screen.getByText(/Trygdeavgift kan ikke beregnes for medlemskapsperiode uten sluttdato/),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });
  });

  describe("feature toggles", () => {
    it("viser advarsel når tidligere år skal skjules", async () => {
      vi.mocked(useFeatureToggle).mockImplementation(
        (toggle) => toggle === MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER,
      );

      renderComponent({
        medlemskapsperioder: [createMockMedlemskapsperiode({ fomDato: "2020-01-01", tomDato: "2020-12-31" })],
      });

      expect(screen.getByText(/Trygdeavgift for tidligere år skal fastsettes på årsavregning/)).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });
  });

  describe("API-kall", () => {
    it("henter opprinnelig trygdeavgiftsgrunnlag ved ny vurdering når skatteforholdsperioder er tom", async () => {
      renderComponent({
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      });

      await waitFor(() => {
        expect(Api.Trygdeavgift.hentOpprinneligTrygdeavgiftsgrunnlag).toHaveBeenCalled();
      });
    });

    it("kaller hentBeregnetTrygdeavgift ved rendering", async () => {
      renderComponent();

      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalledWith(1);
      });
    });
  });

  describe("periodevalg - bruker verdier fra medlemskapsperiode", () => {
    const medlemskapsperiodeDates = { fomDato: "2024-03-01", tomDato: "2024-09-30" };

    it("bruker medlemskapsperiode datoer for FTRL sakstype", async () => {
      vi.mocked(Api.Trygdeavgift.hentBeregnetTrygdeavgift).mockResolvedValue(
        createMockBeregnetTrygdeavgift({
          trygdeavgiftsgrunnlag: {
            skatteforholdsperioder: [{ ...medlemskapsperiodeDates, skatteplikttype: "IKKE_SKATTEPLIKTIG" }],
            inntektskilder: [
              {
                type: "ARBEIDSINNTEKT",
                arbeidsgiversavgiftBetales: false,
                avgiftspliktigInntekt: 50000,
                ...medlemskapsperiodeDates,
                erMaanedsbelop: true,
              },
            ],
          },
        }) as any,
      );

      renderComponent({
        sakstype: MKV.Koder.sakstyper.FTRL,
        medlemskapsperioder: [createMockMedlemskapsperiode(medlemskapsperiodeDates)],
      });

      await waitFor(() => {
        expect(Api.Trygdeavgift.beregnTrygdeavgiftsperioder).toHaveBeenCalled();
      });

      const [, payload] = vi.mocked(Api.Trygdeavgift.beregnTrygdeavgiftsperioder).mock.calls[0];
      expect(payload.skatteforholdsperioder[0].fomDato).toBe(medlemskapsperiodeDates.fomDato);
      expect(payload.skatteforholdsperioder[0].tomDato).toBe(medlemskapsperiodeDates.tomDato);
      expect(payload.inntektskilder[0].fomDato).toBe(medlemskapsperiodeDates.fomDato);
      expect(payload.inntektskilder[0].tomDato).toBe(medlemskapsperiodeDates.tomDato);
    });
  });

  describe("25%-regel og minstebeløp — dataflyt til TrygdeavgiftsperioderTabell", () => {
    const mockPerioderMedBeregningsregel = (perioder: any[]) => {
      vi.mocked(Api.Trygdeavgift.hentBeregnetTrygdeavgift).mockResolvedValue(
        createMockBeregnetTrygdeavgift({
          trygdeavgiftsperioder: perioder,
          trygdeavgiftsgrunnlag: {
            skatteforholdsperioder: [
              { fomDato: "2024-01-01", tomDato: "2024-12-31", skatteplikttype: "IKKE_SKATTEPLIKTIG" },
            ],
            inntektskilder: [
              {
                type: "ARBEIDSINNTEKT",
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
      vi.mocked(Api.Trygdeavgift.beregnTrygdeavgiftsperioder).mockResolvedValue(
        createMockBeregnetTrygdeavgift({ trygdeavgiftsperioder: perioder }) as any,
      );
    };

    const hentTabellPerioder = (): any[] | undefined => {
      const calls = vi.mocked(TrygdeavgiftsperioderTabell).mock.calls;
      const sisteKall = calls[calls.length - 1];
      return sisteKall?.[0]?.perioder;
    };

    it("sender perioder med beregningsregel TJUEFEM_PROSENT_REGEL til tabellen (AC2)", async () => {
      mockPerioderMedBeregningsregel([
        {
          fom: "2024-01-01",
          tom: "2024-12-31",
          avgiftssats: null,
          avgiftPerMd: 3448,
          beregningsregel: "TJUEFEM_PROSENT_REGEL",
        },
      ]);

      renderComponent();

      await waitFor(() => {
        const perioder = hentTabellPerioder();
        expect(perioder).toBeDefined();
        expect(perioder![0].beregningsregel).toBe("TJUEFEM_PROSENT_REGEL");
      });
    });

    it("sender perioder med beregningsregel MINSTEBELØP til tabellen (AC1)", async () => {
      mockPerioderMedBeregningsregel([
        { fom: "2024-01-01", tom: "2024-12-31", avgiftssats: null, avgiftPerMd: 0, beregningsregel: "MINSTEBELØP" },
      ]);

      renderComponent();

      await waitFor(() => {
        const perioder = hentTabellPerioder();
        expect(perioder).toBeDefined();
        expect(perioder![0].beregningsregel).toBe("MINSTEBELØP");
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
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
      expect(screen.queryByRole("heading", { name: /Foreløpig beregnet trygdeavgift/ })).not.toBeInTheDocument();
    });

    it("sender perioder med harSammenslåtteInntektskilder til tabellen (AC4)", async () => {
      mockPerioderMedBeregningsregel([
        {
          fom: "2024-01-01",
          tom: "2024-12-31",
          avgiftssats: null,
          avgiftPerMd: 3448,
          beregningsregel: "TJUEFEM_PROSENT_REGEL",
          harSammenslåtteInntektskilder: true,
        },
      ]);

      renderComponent();

      await waitFor(() => {
        const perioder = hentTabellPerioder();
        expect(perioder).toBeDefined();
        expect(perioder![0].harSammenslåtteInntektskilder).toBe(true);
      });
    });

    it("sender perioder med avgiftsdel til tabellen (AC3)", async () => {
      mockPerioderMedBeregningsregel([
        {
          fom: "2024-01-01",
          tom: "2024-12-31",
          avgiftssats: null,
          avgiftPerMd: 2924,
          beregningsregel: "TJUEFEM_PROSENT_REGEL",
          avgiftsdel: "PENSJON",
        },
        {
          fom: "2024-04-08",
          tom: "2024-12-31",
          avgiftssats: 9.1,
          avgiftPerMd: 1820,
          beregningsregel: "ORDINÆR",
          avgiftsdel: "HELSE",
        },
      ]);

      renderComponent();

      await waitFor(() => {
        const perioder = hentTabellPerioder();
        expect(perioder).toBeDefined();
        expect(perioder!.length).toBe(2);
        expect(perioder![0].avgiftsdel).toBe("PENSJON");
        expect(perioder![1].avgiftsdel).toBe("HELSE");
      });
    });
  });
});
