import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import MKV from "../../../melosyskodeverk";
import { STATUS } from "../../../services";
import {
  MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER,
  MELOSYS_EØS_FAKTURERING_AV_TRYGDEAVGIFT,
} from "../../../featuretoggle/toggleNavn";
import { VurderingTrygdeavgift } from "./vurderingTrygdeavgift";
import * as Api from "../../../services/api";
import { useFeatureToggle } from "../../../featuretoggle";

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

const createMockLovvalgsperiode = (overrides = {}) => ({
  fomDato: "2024-01-01",
  tomDato: "2024-12-31",
  lovvalgsbestemmelse: "ART_11_3_A",
  tilleggBestemmelse: null,
  lovvalgsland: "NO",
  innvilgelsesResultat: MKV.Koder.innvilgelsesResultat.INNVILGET,
  trygdeDekning: null,
  medlemskapstype: MKV.Koder.medlemskapstyper.PLIKTIG,
  medlemskapsperiodeID: 1,
  periodeID: 100,
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
  lovvalgsperioderStatus?: string;
}

const createState = ({
  behandlingstype = MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
  redigerbart = true,
  medlemskapsperioder = [createMockMedlemskapsperiode()],
  sakstype = MKV.Koder.sakstyper.EU_EOS,
  lovvalgsperioder = [createMockLovvalgsperiode()],
  lovvalgsperioderStatus = STATUS.OK,
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
    status: lovvalgsperioderStatus,
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

describe("VurderingTrygdeavgift (lovvalgsperiode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFeatureToggle).mockImplementation((toggle) => toggle === MELOSYS_EØS_FAKTURERING_AV_TRYGDEAVGIFT);
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

    it("viser info når lovvalgsperioden mangler sluttdato", async () => {
      renderComponent({
        lovvalgsperioder: [createMockLovvalgsperiode({ tomDato: undefined })],
        redigerbart: false,
      });

      expect(screen.getByText(/Trygdeavgift kan ikke beregnes for lovvalgsperiode uten sluttdato/)).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });
  });

  describe("feature toggles", () => {
    it("viser advarsel når tidligere år skal skjules", async () => {
      vi.mocked(useFeatureToggle).mockImplementation(
        (toggle) =>
          toggle === MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER ||
          toggle === MELOSYS_EØS_FAKTURERING_AV_TRYGDEAVGIFT,
      );

      renderComponent({
        lovvalgsperioder: [createMockLovvalgsperiode({ fomDato: "2020-01-01", tomDato: "2020-12-31" })],
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

  describe("periodevalg - bruker verdier fra lovvalgsperiode", () => {
    it("bruker lovvalgsperiode datoer i beregning", async () => {
      const lovvalgsperiodeDates = { fomDato: "2024-03-01", tomDato: "2024-09-30" };

      vi.mocked(Api.Trygdeavgift.hentBeregnetTrygdeavgift).mockResolvedValue(
        createMockBeregnetTrygdeavgift({
          trygdeavgiftsgrunnlag: {
            skatteforholdsperioder: [{ ...lovvalgsperiodeDates, skatteplikttype: "IKKE_SKATTEPLIKTIG" }],
            inntektskilder: [
              {
                type: "ARBEIDSINNTEKT",
                arbeidsgiversavgiftBetales: false,
                avgiftspliktigInntekt: 50000,
                ...lovvalgsperiodeDates,
                erMaanedsbelop: true,
              },
            ],
          },
        }) as any,
      );

      renderComponent({
        lovvalgsperioder: [createMockLovvalgsperiode(lovvalgsperiodeDates)],
      });

      await waitFor(() => {
        expect(Api.Trygdeavgift.beregnTrygdeavgiftsperioder).toHaveBeenCalled();
      });

      const [, payload] = vi.mocked(Api.Trygdeavgift.beregnTrygdeavgiftsperioder).mock.calls[0];
      expect(payload.skatteforholdsperioder[0].fomDato).toBe(lovvalgsperiodeDates.fomDato);
      expect(payload.skatteforholdsperioder[0].tomDato).toBe(lovvalgsperiodeDates.tomDato);
      expect(payload.inntektskilder[0].fomDato).toBe(lovvalgsperiodeDates.fomDato);
      expect(payload.inntektskilder[0].tomDato).toBe(lovvalgsperiodeDates.tomDato);
    });
  });

  describe("EØS-spesifikk oppførsel", () => {
    it("rendrer korrekt for EU_EOS sakstype med EØS-toggle aktivert", async () => {
      renderComponent();

      expect(screen.getByRole("heading", { name: "Trygdeavgift" })).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });

    it("rendrer korrekt for EU_EOS sakstype uten EØS-toggle", async () => {
      vi.mocked(useFeatureToggle).mockReturnValue(false);

      renderComponent();

      expect(screen.getByRole("heading", { name: "Trygdeavgift" })).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });
  });

  describe("ny vurdering tekst", () => {
    it("viser ny vurdering tekst for NY_VURDERING behandlingstype", async () => {
      renderComponent({
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
      });

      expect(
        screen.getByText(/Ved ny vurdering vises tidligere perioder med skatteforhold og inntekt/),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });

    it("viser ikke ny vurdering tekst for FØRSTEGANG behandlingstype", async () => {
      renderComponent();

      expect(
        screen.queryByText(/Ved ny vurdering vises tidligere perioder med skatteforhold og inntekt/),
      ).not.toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });

    it("skjuler ny vurdering tekst når ikke redigerbart", async () => {
      renderComponent({
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING,
        redigerbart: false,
      });

      expect(
        screen.queryByText(/Ved ny vurdering vises tidligere perioder med skatteforhold og inntekt/),
      ).not.toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });

    it("viser ny vurdering tekst for MANGLENDE_INNBETALING_TRYGDEAVGIFT behandlingstype", async () => {
      renderComponent({
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.MANGLENDE_INNBETALING_TRYGDEAVGIFT,
      });

      expect(
        screen.getByText(/Ved ny vurdering vises tidligere perioder med skatteforhold og inntekt/),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });
  });

  describe("seksjon-synlighet", () => {
    it("viser skatteforholdsperioder-seksjon når lovvalgsperiode har fom og tom", async () => {
      renderComponent();

      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
      expect(screen.getByText("Oppgi informasjon om brukers skatteforhold")).toBeInTheDocument();
      expect(screen.getByTestId("skatteforholdsperioder")).toBeInTheDocument();
    });

    it("skjuler skatteforholdsperioder og inntektskilder når lovvalgsperiode har åpen sluttdato", async () => {
      renderComponent({
        lovvalgsperioder: [createMockLovvalgsperiode({ tomDato: undefined })],
      });

      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
      expect(screen.queryByText("Oppgi informasjon om brukers skatteforhold")).not.toBeInTheDocument();
      expect(screen.queryByTestId("skatteforholdsperioder")).not.toBeInTheDocument();
      expect(screen.queryByText("Oppgi informasjon om brukers inntekt")).not.toBeInTheDocument();
      expect(screen.queryByTestId("inntektskilder")).not.toBeInTheDocument();
    });

    it("viser inntektskilder-seksjon når skatteforhold ikke er skattepliktig i hele perioden", async () => {
      vi.mocked(Api.Trygdeavgift.hentBeregnetTrygdeavgift).mockResolvedValue(
        createMockBeregnetTrygdeavgift({
          trygdeavgiftsgrunnlag: {
            skatteforholdsperioder: [
              { fomDato: "2024-01-01", tomDato: "2024-12-31", skatteplikttype: "IKKE_SKATTEPLIKTIG" },
            ],
            inntektskilder: [],
          },
        }) as any,
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId("inntektskilder")).toBeInTheDocument();
      });
      expect(screen.getByText("Oppgi informasjon om brukers inntekt")).toBeInTheDocument();
    });
  });

  describe("knapper", () => {
    it("bekreft-knapp er disabled når ikke redigerbart", async () => {
      renderComponent({ redigerbart: false });

      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
      expect(screen.getByRole("button", { name: "Bekreft og fortsett" })).toBeDisabled();
    });

    it("tilbake-knapp er disabled når ikke redigerbart", async () => {
      renderComponent({ redigerbart: false });

      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
      expect(screen.getByRole("button", { name: "Tilbake" })).toBeDisabled();
    });
  });

  describe("oppdaterStatus", () => {
    it("kaller oppdaterStatus med steg-gyldighet", async () => {
      const oppdaterStatus = vi.fn();
      renderComponent({}, { oppdaterStatus });

      await waitFor(() => {
        expect(oppdaterStatus).toHaveBeenCalled();
      });
    });
  });

  describe("API-kall ved ulike tilstander", () => {
    it("kaller hentBeregnetTrygdeavgift selv når redigerbart er false", async () => {
      renderComponent({ redigerbart: false });

      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalledWith(1);
      });
    });

    it("henter opprinnelig trygdeavgiftsgrunnlag ved MANGLENDE_INNBETALING_TRYGDEAVGIFT når skatteforholdsperioder er tom", async () => {
      renderComponent({
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.MANGLENDE_INNBETALING_TRYGDEAVGIFT,
      });

      await waitFor(() => {
        expect(Api.Trygdeavgift.hentOpprinneligTrygdeavgiftsgrunnlag).toHaveBeenCalled();
      });
    });
  });

  describe("tidligere perioder toggle", () => {
    it("skjuler skatteforhold og inntektskilder når toggle er på og alle perioder er fra tidligere år", async () => {
      vi.mocked(useFeatureToggle).mockImplementation(
        (toggle) =>
          toggle === MELOSYS_FAKTURERINGSKOMPONENTEN_IKKE_TIDLIGERE_PERIODER ||
          toggle === MELOSYS_EØS_FAKTURERING_AV_TRYGDEAVGIFT,
      );

      renderComponent({
        lovvalgsperioder: [createMockLovvalgsperiode({ fomDato: "2020-01-01", tomDato: "2020-12-31" })],
      });

      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });

      expect(screen.queryByText("Oppgi informasjon om brukers skatteforhold")).not.toBeInTheDocument();
      expect(screen.queryByTestId("skatteforholdsperioder")).not.toBeInTheDocument();
    });
  });

  describe("info-meldinger", () => {
    it("viser åpen sluttdato-melding med lovvalgsperiode-tekst", async () => {
      renderComponent({
        lovvalgsperioder: [createMockLovvalgsperiode({ tomDato: undefined })],
      });

      expect(screen.getByText(/Trygdeavgift kan ikke beregnes for lovvalgsperiode uten sluttdato/)).toBeInTheDocument();
      expect(screen.getByText(/må du angi sluttdato på lovvalgsperiode/)).toBeInTheDocument();
      await waitFor(() => {
        expect(Api.Trygdeavgift.hentBeregnetTrygdeavgift).toHaveBeenCalled();
      });
    });
  });
});
