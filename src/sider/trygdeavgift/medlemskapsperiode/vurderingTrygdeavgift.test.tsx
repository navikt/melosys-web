import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import MKV from "../../../melosyskodeverk";
import { STATUS } from "../../../services";
import { MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER } from "../../../featuretoggle/toggleNavn";
import { VurderingTrygdeavgift } from "./vurderingTrygdeavgift";
import * as Api from "../../../services/api";
import { useFeatureToggle } from "../../../featuretoggle";

vi.mock("../../services/api", () => ({
  Trygdeavgift: {
    hentBeregnetTrygdeavgift: vi.fn(),
    hentOpprinneligTrygdeavgiftsgrunnlag: vi.fn(),
    beregnTrygdeavgiftsperioder: vi.fn(),
  },
}));

vi.mock("../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));

vi.mock("../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder", () => ({
  Skatteforholdsperioder: () => <div data-testid="skatteforholdsperioder">Skatteforholdsperioder</div>,
}));

vi.mock("../../felleskomponenter/trygdeavgift/komponenter/inntektskilder", () => ({
  Inntektskilder: () => <div data-testid="inntektskilder">Inntektskilder</div>,
}));

vi.mock("../../felleskomponenter/trygdeavgift/komponenter/trygdeavgiftsperioderTabell", () => ({
  default: () => <div data-testid="trygdeavgiftstabell">TrygdeavgiftsperioderTabell</div>,
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
    it("rendrer ingenting når steget ikke er aktivt", () => {
      const { container } = renderComponent({}, { aktivtSteg: false });

      expect(container.firstChild).toBeNull();
    });

    it("viser heading når steget er aktivt", () => {
      renderComponent();

      expect(screen.getByRole("heading", { name: "Trygdeavgift" })).toBeInTheDocument();
    });

    it("viser info når medlemskapsperioden mangler sluttdato", () => {
      renderComponent({
        medlemskapsperioder: [createMockMedlemskapsperiode({ tomDato: undefined })],
        redigerbart: false,
      });

      expect(
        screen.getByText(/Trygdeavgift kan ikke beregnes for medlemskapsperiode uten sluttdato/),
      ).toBeInTheDocument();
    });
  });

  describe("feature toggles", () => {
    it("viser advarsel når tidligere år skal skjules", () => {
      vi.mocked(useFeatureToggle).mockImplementation(
        (toggle) => toggle === MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER,
      );

      renderComponent({
        medlemskapsperioder: [createMockMedlemskapsperiode({ fomDato: "2020-01-01", tomDato: "2020-12-31" })],
      });

      expect(screen.getByText(/Trygdeavgift for tidligere år skal fastsettes på årsavregning/)).toBeInTheDocument();
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
});
