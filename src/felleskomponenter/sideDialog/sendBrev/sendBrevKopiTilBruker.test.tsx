import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import SendBrev from "./sendBrev";
import * as Api from "../../../services/api";
import { FeilmeldingProps } from "../../../services/modules/dokumenter-v2";

const brevType: Api.DokumenterV2.TilgjengeligBrev = {
  type: { kode: "MANGELBREV_ARBEIDSGIVER", term: "Mangelbrev" },
  felter: [],
};

const arbeidsgiverMottaker: Api.DokumenterV2.TilgjengeligMottaker = {
  uuid: "mottaker-uuid",
  type: "Arbeidsgiver eller arbeidsgivers fullmektig",
  rolle: "ARBEIDSGIVER",
  adresser: null,
  feilmelding: undefined,
  trygdemyndighet: null,
};

const lagBrukerMottaker = (feilmelding?: FeilmeldingProps): Api.DokumenterV2.TilgjengeligMottaker => ({
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
    hentMuligeMottakere: vi.fn().mockResolvedValue({
      hovedMottaker: { mottakerNavn: "Arbeidsgiver", dokumentNavn: "Brev", rolle: "ARBEIDSGIVER" },
      kopiMottakere: [{ mottakerNavn: "Bruker", dokumentNavn: "Kopi", rolle: "BRUKER", aktørId: "aktørId" }],
      fasteMottakere: [],
    }),
    opprettBrev: vi.fn(),
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
vi.mock("../../dokumentliste", () => ({ default: () => <div>Forhåndsvisning</div> }));
vi.mock("./brevVedlegg/brevVedlegg", () => ({ default: () => <div>Vedlegg</div> }));
vi.mock("./brevMottaker/brevMottaker", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("./brevMottaker/brevMottaker")),
  default: () => <div>BrevMottaker Mock</div>,
}));

const renderSendBrev = () =>
  renderWithProviders(<SendBrev behandlingID={123} redigerbart dokumenter={[]} />, {
    preloadedState: {
      form: {
        send_brev: {
          values: {
            mottaker: arbeidsgiverMottaker.uuid,
            valgtMottaker: arbeidsgiverMottaker,
            arbeidsgiver: "999999999",
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

const mockTilgjengeligeMaler = (brukerFeilmelding?: FeilmeldingProps) =>
  vi.mocked(Api.DokumenterV2.hentTilgjengeligeMaler).mockResolvedValue([
    { mottaker: arbeidsgiverMottaker, brevTyper: [brevType] },
    { mottaker: lagBrukerMottaker(brukerFeilmelding), brevTyper: [] },
  ]);

describe("SendBrev – kopi til bruker/brukers fullmektig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deaktiverer Send brev, men ikke Lagre utkast, og viser feilen fra kopimottakeren", async () => {
    mockTilgjengeligeMaler({
      tittel: "Ingen gyldig adresse funnet",
      underpunkter: [{ underpunkt: "Bruker må registrere en adresse." }],
    });

    renderSendBrev();
    await userEvent.click(await screen.findByRole("checkbox", { name: "Send kopi til bruker/brukers fullmektig" }));

    expect(screen.getByRole("checkbox", { name: "Send kopi til bruker/brukers fullmektig" })).toBeChecked();
    expect(await screen.findByText("Ingen gyldig adresse funnet")).toBeVisible();
    expect(screen.getByText("Ingen gyldig adresse funnet").closest(".alertstripe_feil")).toHaveTextContent(
      "Bruker må registrere en adresse.",
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "Lagre utkast" })).toBeEnabled());
    expect(screen.getByRole("button", { name: "Send brev" })).toBeDisabled();
    expect(screen.getByText("Bruker må registrere en adresse.")).toBeVisible();
  });

  it("ignorerer kopimottakerens feil når kopi ikke er valgt", async () => {
    mockTilgjengeligeMaler({ tittel: "En feil fra backend" });

    renderSendBrev();

    // Sjekkboksen vises først når mulige mottakere er hentet, som kan skje etter at Send brev er aktivert.
    expect(await screen.findByRole("checkbox", { name: "Send kopi til bruker/brukers fullmektig" })).not.toBeChecked();
    await waitFor(() => expect(screen.getByRole("button", { name: "Send brev" })).toBeEnabled());
    expect(screen.queryByText("En feil fra backend")).not.toBeInTheDocument();
  });

  it("lar Send brev være aktiv når kopimottaker har gyldig adresse", async () => {
    mockTilgjengeligeMaler();

    renderSendBrev();
    await userEvent.click(await screen.findByRole("checkbox", { name: "Send kopi til bruker/brukers fullmektig" }));

    expect(screen.getByRole("checkbox", { name: "Send kopi til bruker/brukers fullmektig" })).toBeChecked();
    await waitFor(() => expect(screen.getByRole("button", { name: "Send brev" })).toBeEnabled());
  });

  it.each([
    [
      "Ingen gyldig adresse funnet. Bruker må registrere adresse.",
      "Brevet er ikke sendt. Ingen gyldig adresse funnet. Bruker må registrere adresse.",
    ],
    ["Ugyldig JSON-skjema: #/mottaker/adresselinjer", "Brevet er ikke sendt. Det skjedde en feil."],
  ])("viser riktig feilmelding for avvist brev: %s", async (backendMelding, forventetMelding) => {
    mockTilgjengeligeMaler();
    vi.mocked(Api.DokumenterV2.opprettBrev).mockRejectedValueOnce({
      status: 400,
      body: { message: backendMelding },
    });

    renderSendBrev();
    const sendBrevKnapp = await screen.findByRole("button", { name: "Send brev" });
    await waitFor(() => expect(sendBrevKnapp).toBeEnabled());
    await userEvent.click(sendBrevKnapp);

    expect(await screen.findByText(forventetMelding)).toBeVisible();
    expect(screen.queryByText(/Ugyldig JSON-skjema/)).not.toBeInTheDocument();
  });
});
