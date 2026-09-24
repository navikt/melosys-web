import { screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import SendBrev from "./sendBrev";
import * as Api from "../../../services/api";

const brevType = {
  type: { kode: "MANGELBREV_ARBEIDSGIVER", term: "Mangelbrev" },
  felter: [],
};

const arbeidsgiverMottaker = {
  uuid: "mottaker-uuid",
  type: "Arbeidsgiver eller arbeidsgivers fullmektig",
  rolle: "ARBEIDSGIVER",
  adresser: null,
  feilmelding: undefined,
  trygdemyndighet: null,
};

const lagBrukerMottaker = (feilmelding?: { tittel: string }) => ({
  uuid: "mottaker-uuid",
  type: "Bruker eller brukers fullmektig",
  rolle: "BRUKER",
  adresser: null,
  feilmelding,
  trygdemyndighet: null,
});

vi.mock("../../../services/api", () => ({
  DokumenterV2: {
    hentTilgjengeligeMaler: vi.fn(),
    hentTilgjengeligeStandardvedlegg: vi.fn().mockResolvedValue([]),
    hentMuligeMottakere: vi.fn().mockResolvedValue({ hovedMottaker: {}, kopiMottakere: [], fasteMottakere: [] }),
    konverterMuligMottakerTilKopiMottaker: vi.fn((m) => m),
  },
  Brevutkast: {
    hentBrevutkast: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../../../utils", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("../../../utils")),
  _uuid: () => "mottaker-uuid",
}));

vi.mock("./brevValgMedPlaceholdere", () => ({ default: () => <div>BrevValg Mock</div> }));
vi.mock("./brevutkast/brevutkast", () => ({ default: () => <div>Brevutkast Mock</div> }));
vi.mock("./brevMottaker/brevMottakereTabell", () => ({ default: () => <div>BrevMottakereTabell Mock</div> }));
vi.mock("./brevMottaker/brevMottaker", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("./brevMottaker/brevMottaker")),
  default: () => <div>BrevMottaker Mock</div>,
}));

const renderSendBrev = (kopiTilBruker: boolean) =>
  renderWithProviders(<SendBrev behandlingID={123} redigerbart dokumenter={[]} />, {
    preloadedState: {
      form: {
        send_brev: {
          values: {
            mottaker: arbeidsgiverMottaker.uuid,
            valgtMottaker: arbeidsgiverMottaker,
            arbeidsgiver: "999999999",
            kopiTilBruker,
            // Låser reset-effektene som ellers tømmer skjemaet rett etter mount.
            aktivtUtkast: { utkastBrevID: 1 },
            felt: {},
          },
        },
      },
      behandlinger: { data: [{ behandlingID: 123, saksnummer: "12345678" }] },
      dokumenter: { data: [] },
    },
  });

const mockTilgjengeligeMaler = (brukerFeilmelding?: { tittel: string }) =>
  vi.mocked(Api.DokumenterV2.hentTilgjengeligeMaler).mockResolvedValue([
    { mottaker: arbeidsgiverMottaker, brevTyper: [brevType] },
    { mottaker: lagBrukerMottaker(brukerFeilmelding), brevTyper: [] },
  ] as any);

describe("SendBrev – kopi til bruker/brukers fullmektig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deaktiverer Send brev, men ikke Lagre utkast, når kopimottaker mangler gyldig adresse", async () => {
    mockTilgjengeligeMaler({ tittel: "Ingen gyldig adresse funnet" });

    renderSendBrev(true);

    await waitFor(() => expect(screen.getByRole("button", { name: "Lagre utkast" })).toBeEnabled());
    expect(screen.getByRole("button", { name: "Send brev" })).toBeDisabled();
  });

  it("lar Send brev være aktiv når kopi ikke er valgt", async () => {
    mockTilgjengeligeMaler({ tittel: "Ingen gyldig adresse funnet" });

    renderSendBrev(false);

    await waitFor(() => expect(screen.getByRole("button", { name: "Send brev" })).toBeEnabled());
  });

  it("lar Send brev være aktiv når kopimottaker har gyldig adresse", async () => {
    mockTilgjengeligeMaler();

    renderSendBrev(true);

    await waitFor(() => expect(screen.getByRole("button", { name: "Send brev" })).toBeEnabled());
  });
});
