import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import MKV from "../../../melosyskodeverk";
import { STATUS } from "../../../services";
import { MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER } from "../../../featuretoggle/toggleNavn";
import { VurderingTrygdeavgift } from "./vurderingTrygdeavgift";
import * as Api from "../../../services/api";
import { useFeatureToggle } from "../../../featuretoggle";

vi.mock("../../../services/api", () => ({
  Trygdeavgift: {
    hentBeregnetTrygdeavgiftEosPensjonist: vi.fn(),
    hentOpprinneligTrygdeavgiftsgrunnlag: vi.fn(),
    eøsPensjonistBeregnTrygdeavgiftsperioder: vi.fn(),
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
  default: () => <div data-testid="trygdeavgiftstabell">TrygdeavgiftsperioderTabell</div>,
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
  behandlingstema?: string;
  redigerbart?: boolean;
  sakstype?: string;
  helseutgiftDekkesPeriode?: { fomDato: string; tomDato: string };
}

const createState = ({
  behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
  behandlingstema = MKV.Koder.behandlinger.behandlingstema.PENSJONIST,
  redigerbart = true,
  sakstype = MKV.Koder.sakstyper.EU_EOS,
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

describe("VurderingTrygdeavgift (helseutgiftDekkesPeriode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockReturnValue(false);
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
    it("rendrer ingenting når steget ikke er aktivt", async () => {
      const { container } = renderComponent({}, { aktivtSteg: false });

      expect(container.firstChild).toBeNull();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgiftEosPensjonist).toHaveBeenCalled();
      });
    });

    it("viser heading når steget er aktivt", async () => {
      renderComponent();

      expect(screen.getByRole("heading", { name: "Trygdeavgift" })).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgiftEosPensjonist).toHaveBeenCalled();
      });
    });
  });

  describe("feature toggles", () => {
    it("viser advarsel når tidligere år skal skjules", async () => {
      vi.mocked(useFeatureToggle).mockImplementation(
        (toggle) => toggle === MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER,
      );

      renderComponent({
        helseutgiftDekkesPeriode: { fomDato: "2020-01-01", tomDato: "2020-12-31" },
      });

      expect(screen.getByText(/Trygdeavgift for tidligere år skal fastsettes på årsavregning/)).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgiftEosPensjonist).toHaveBeenCalled();
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

    it("kaller hentBeregnetTrygdeavgiftEosPensjonist ved rendering", async () => {
      renderComponent();

      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgiftEosPensjonist).toHaveBeenCalledWith(1);
      });
    });
  });
});
