import { describe, it, expect, vi, beforeEach } from "vitest";
import { VurderingVedtak } from "./vurderingVedtak";
import { renderWithProvidersAsync } from "../../../../ducks/test-utils/renderWithProviders";
import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";

Object.defineProperty(window, "scrollTo", {
  value: vi.fn(),
  writable: true,
});

// Mock only the API calls to prevent network requests
vi.mock("../../../../services/api", () => ({
  Aarsavregning: {
    hentAarsavregning: vi.fn(),
  },
  DokumenterV2: {
    hentMuligeMottakere: vi.fn(),
    hentStandardvedleggForBrev: vi.fn(),
    tomHentMuligeMottakereResDto: () => ({
      hovedMottaker: null,
      kopiMottakere: [],
      fasteMottakere: [],
    }),
    konverterMuligMottakerTilKopiMottaker: vi.fn(),
  },
  Trygdeavgift: {
    hentFakturamottaker: vi.fn(),
  },
  Fagsaker: {
    aktoer: {
      hent: vi.fn(),
    },
  },
  Behandlinger: {
    resultat: {
      oppdaterFritekster: vi.fn(),
    },
  },
}));

const { BEREGNET_AVGIFT } = MKV.Koder.endeligAvgiftValg;
const { FULLMEKTIG_TRYGDEAVGIFT } = MKV.Koder.fullmaktstype;

describe("VurderingVedtak", () => {
  beforeEach(() => {
    // Setup realistic API mock responses
    const mockAarsavregningResponse = {
      aarsavregningID: 12345,
      aar: 2024,
      endeligAvgiftValg: BEREGNET_AVGIFT,
      avregning: {
        tidligereFakturertBeloep: 25000,
        trygdeavgiftFraAvgiftssystemet: 30000,
        beregnetAvgiftBelop: 28000,
        manueltAvgiftBeloep: undefined,
      },
      harTrygdeavgiftFraAvgiftssystemet: true,
      sisteGjeldendeAvgiftspliktigperioder: [],
      tidligereTrygdeavgiftsGrunnlagsopplysninger: {
        trygdeavgiftsgrunnlag: {
          avgiftspliktigperioder: [],
          skatteforholdsperioder: [],
          inntektskperioder: [],
        },
        avgift: {
          trygdeavgiftsperioder: [],
          totalInntekt: 500000,
          totalAvgift: 27000,
        },
        tidligereTrygdeavgiftFraAvgiftssystemet: 27000,
      },
    };

    const mockMuligeMottakere = {
      hovedMottaker: {
        rolle: "SØKER",
        mottakerNavn: "Ola Nordmann",
        dokumentNavn: "Vedtak årsavregning 2024",
        orgnr: null,
        aktørId: "123456789",
        institusjonID: null,
      },
      kopiMottakere: [
        {
          rolle: "ARBEIDSGIVER",
          mottakerNavn: "Acme AS",
          dokumentNavn: "Kopi av vedtak årsavregning 2024",
          orgnr: "123456789",
          aktørId: null,
          institusjonID: null,
        },
      ],
      fasteMottakere: [],
    };

    vi.mocked(Api.Aarsavregning.hentAarsavregning).mockResolvedValue(mockAarsavregningResponse);
    vi.mocked(Api.DokumenterV2.hentMuligeMottakere).mockResolvedValue(mockMuligeMottakere);
    vi.mocked(Api.DokumenterV2.hentStandardvedleggForBrev).mockResolvedValue([
      {
        dokumentId: "vedlegg1",
        dokumentNavn: "Informasjon om trygdeavgift",
        erValgt: true,
      },
    ]);
    vi.mocked(Api.Trygdeavgift.hentFakturamottaker).mockResolvedValue({
      navn: "Acme AS",
    });
    vi.mocked(Api.Fagsaker.aktoer.hent).mockResolvedValue([
      {
        aktoerID: "aktør123",
        rolleKode: "FULLMEKTIG",
        fullmakter: [FULLMEKTIG_TRYGDEAVGIFT],
      },
    ]);
    vi.mocked(Api.Behandlinger.resultat.oppdaterFritekster).mockResolvedValue({});
  });

  it("should render snapshot with realistic data", async () => {
    const mockProps = {
      tilbake: vi.fn(),
      aktivtSteg: true,
    };

    // Create proper Redux state structure
    const initialReduxState = {
      behandlinger: {
        status: "OK",
        data: {
          behandlingID: 12345,
          redigerbart: true, // This is where redigerbart is actually stored
        },
      },
      menypanel: {
        status: "OK",
        data: {
          erFullmektigEndret: false,
        },
      },
      fagsaker: {
        status: "OK",
        data: {
          saksnummer: "SAK123456",
        },
      },
      behandlingsresultat: {
        status: "OK",
        data: {
          innledningFritekst: "Dette er en innledning til vedtaket om årsavregning for 2024.",
          begrunnelseFritekst: "Basert på innsendte opplysninger er trygdeavgiften fastsatt til kr 28.000.",
        },
      },
    };

    const { container } = await renderWithProvidersAsync(<VurderingVedtak {...mockProps} />, {
      preloadedState: initialReduxState,
    });

    // Wait for async operations to complete
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(container).toMatchSnapshot();
  });
});
