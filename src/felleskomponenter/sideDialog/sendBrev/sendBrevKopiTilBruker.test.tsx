import { screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import SendBrev from "./sendBrev";
import * as Api from "../../../services/api";
import { FeilmeldingProps } from "../../../services/modules/dokumenter-v2";

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

const lagBrukerMottaker = (feilmelding?: FeilmeldingProps) => ({
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
vi.mock("./brevMottaker/brevMottakereTabell", () => ({
  default: ({ kopimottakerFeilmelding }: { kopimottakerFeilmelding?: FeilmeldingProps }) => (
    <div>
      {kopimottakerFeilmelding?.tittel}
      {kopimottakerFeilmelding?.underpunkter?.map((item) => (
        <div key={item.underpunkt}>{item.underpunkt}</div>
      ))}
    </div>
  ),
}));
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

const mockTilgjengeligeMaler = (brukerFeilmelding?: FeilmeldingProps) =>
  vi.mocked(Api.DokumenterV2.hentTilgjengeligeMaler).mockResolvedValue([
    { mottaker: arbeidsgiverMottaker, brevTyper: [brevType] },
    { mottaker: lagBrukerMottaker(brukerFeilmelding), brevTyper: [] },
  ] as any);

describe("SendBrev – kopi til bruker/brukers fullmektig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deaktiverer Send brev, men ikke Lagre utkast, og viser feilen fra kopimottakeren", async () => {
    mockTilgjengeligeMaler({
      tittel: "Ingen gyldig adresse funnet",
      underpunkter: [{ underpunkt: "Bruker må registrere en adresse." }],
    });

    renderSendBrev(true);

    await waitFor(() => expect(screen.getByRole("button", { name: "Lagre utkast" })).toBeEnabled());
    expect(screen.getByRole("button", { name: "Send brev" })).toBeDisabled();
    expect(screen.getByText("Ingen gyldig adresse funnet")).toBeVisible();
    expect(screen.getByText("Bruker må registrere en adresse.")).toBeVisible();
  });

  it("ignorerer kopimottakerens feil når kopi ikke er valgt", async () => {
    mockTilgjengeligeMaler({ tittel: "En feil fra backend" });

    renderSendBrev(false);

    await waitFor(() => expect(screen.getByRole("button", { name: "Send brev" })).toBeEnabled());
    expect(screen.queryByText("En feil fra backend")).not.toBeInTheDocument();
  });

  it("lar Send brev være aktiv når kopimottaker har gyldig adresse", async () => {
    mockTilgjengeligeMaler();

    renderSendBrev(true);

    await waitFor(() => expect(screen.getByRole("button", { name: "Send brev" })).toBeEnabled());
  });
});
