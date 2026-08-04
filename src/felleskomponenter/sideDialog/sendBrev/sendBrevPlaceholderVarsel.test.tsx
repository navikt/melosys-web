import { fireEvent, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import SendBrev from "./sendBrev";
import * as Api from "../../../services/api";
import * as Placeholdere from "../../../services/modules/placeholdere";
import { MELOSYS_TEKSTBLOKKER, MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER } from "../../../featuretoggle/toggleNavn";
import { STATUS } from "../../../services";

const FRITEKST_HTML =
  '<p>Saken <span class="placeholder-utfylt" data-placeholder="saksnummer">MEL-21</span> er mottatt.</p>';

const brevType = {
  type: { kode: "ORIENTERING", term: "Orientering" },
  felter: [
    {
      kode: "FRITEKST",
      beskrivelse: "Hovedtekst",
      feltType: "FRITEKST",
      hjelpetekst: null,
      paakrevd: true,
      tegnBegrensning: null,
      valg: null,
    },
  ],
};

const mottaker = {
  uuid: "mottaker-uuid",
  type: "BRUKER",
  rolle: "BRUKER",
  adresser: null,
  feilmelding: undefined,
  trygdemyndighet: null,
};

vi.mock("../../../services/api", () => ({
  DokumenterV2: {
    FeltType: { TEKST: "TEKST", FRITEKST: "FRITEKST", SJEKKBOKS: "SJEKKBOKS", FORMTITTEL: "FORMTITTEL" },
    hentTilgjengeligeMaler: vi.fn(),
    hentTilgjengeligeStandardvedlegg: vi.fn().mockResolvedValue([]),
    hentMuligeMottakereNorskMyndighet: vi.fn().mockResolvedValue({ mottakere: [], kopiMottakere: [] }),
    hentMuligeMottakere: vi.fn().mockResolvedValue({ mottakere: [], kopiMottakere: [] }),
    opprettBrev: vi.fn().mockResolvedValue({}),
    konverterMuligMottakerTilKopiMottaker: vi.fn((m) => m),
  },
  Brevutkast: {
    hentBrevutkast: vi.fn().mockResolvedValue([]),
    slettBrevutkast: vi.fn().mockResolvedValue({}),
    lagreBrevutkast: vi.fn().mockResolvedValue({}),
    oppdaterBrevutkast: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("../../../services/modules/placeholdere", async () => ({
  ...(await vi.importActual<typeof Placeholdere>("../../../services/modules/placeholdere")),
  hentVerdier: vi.fn(),
}));

vi.mock("../../../services/api/placeholdere", () => ({
  usePlaceholderVerdier: () => ({ data: undefined }),
  usePlaceholderKatalog: () => ({ data: [{ nokkel: "saksnummer", visningsnavn: "Saksnummer" }] }),
  useBetingelseVerdier: () => ({ data: [] }),
  useBetingelseKatalog: () => ({ data: [] }),
}));

// Malene får uuid tildelt ved henting; en fast uuid lar skjemaverdiene peke på riktig mal.
vi.mock("../../../utils", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("../../../utils")),
  _uuid: () => "mottaker-uuid",
}));

// Editoren (Quill) er irrelevant for flyten; skjemaverdiene leses fra redux-form.
vi.mock("./brevValg", () => ({ default: () => <div>BrevValg Mock</div> }));
vi.mock("./brevutkast/brevutkast", () => ({ default: () => <div>Brevutkast Mock</div> }));
vi.mock("./brevMottaker/brevMottakereTabell", () => ({ default: () => <div>BrevMottakereTabell Mock</div> }));
vi.mock("./brevMottaker/brevMottaker", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("./brevMottaker/brevMottaker")),
  default: () => <div>BrevMottaker Mock</div>,
}));

const preloadedState = {
  form: {
    send_brev: {
      values: {
        mottaker: mottaker.uuid,
        valgtMottaker: mottaker,
        // Låser reset-effektene som ellers tømmer skjemaet rett etter mount.
        aktivtUtkast: { utkastBrevID: 1 },
        felt: { FRITEKST: { feltVerdi: FRITEKST_HTML } },
      },
    },
  },
  featureToggle: {
    status: STATUS.OK,
    data: { [MELOSYS_TEKSTBLOKKER]: true, [MELOSYS_TEKSTBLOKKER_DYNAMISK_PLACEHOLDER]: true },
  },
  behandlinger: { data: [{ behandlingID: 123, saksnummer: "12345678" }] },
  dokumenter: { data: [] },
};

const renderSendBrev = () =>
  renderWithProviders(<SendBrev behandlingID={123} redigerbart dokumenter={[]} />, { preloadedState });

const renderMedFritekst = (fritekst: string) =>
  renderWithProviders(<SendBrev behandlingID={123} redigerbart dokumenter={[]} />, {
    preloadedState: {
      ...preloadedState,
      form: {
        send_brev: {
          values: { ...preloadedState.form.send_brev.values, felt: { FRITEKST: { feltVerdi: fritekst } } },
        },
      },
    },
  });

const klikkSendBrev = async () => {
  const knapp = await screen.findByRole("button", { name: "Send brev" });
  await waitFor(() => expect(knapp).toBeEnabled());
  fireEvent.click(knapp);
};

const ventPaaBestilt = async () => {
  await waitFor(() => expect(Api.DokumenterV2.opprettBrev).toHaveBeenCalledTimes(1));
  await screen.findByText(/Brevet er bestilt/);
};

describe("SendBrev – varsel om utdaterte placeholder-verdier", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Api.DokumenterV2.hentTilgjengeligeMaler).mockResolvedValue([{ mottaker, brevTyper: [brevType] }] as any);
    vi.mocked(Api.DokumenterV2.opprettBrev).mockResolvedValue({} as any);
  });

  it("varsler og holder brevet tilbake når en innsatt verdi er utdatert", async () => {
    vi.mocked(Placeholdere.hentVerdier).mockResolvedValue({ verdier: [{ nokkel: "saksnummer", verdi: "MEL-22" }] });

    renderSendBrev();
    await klikkSendBrev();

    expect(await screen.findByText("Noen innsatte verdier er utdaterte")).toBeInTheDocument();
    expect(screen.getByText("Saksnummer: innsatt MEL-21, nå MEL-22")).toBeInTheDocument();
    expect(Api.DokumenterV2.opprettBrev).not.toHaveBeenCalled();
  });

  it("sender brevet når saksbehandler velger Send likevel", async () => {
    vi.mocked(Placeholdere.hentVerdier).mockResolvedValue({ verdier: [{ nokkel: "saksnummer", verdi: "MEL-22" }] });

    renderSendBrev();
    await klikkSendBrev();

    fireEvent.click(await screen.findByRole("button", { name: "Send likevel" }));

    await ventPaaBestilt();
    expect(screen.queryByText("Noen innsatte verdier er utdaterte")).not.toBeInTheDocument();
  });

  it("lar saksbehandler avbryte og komme tilbake til skjemaet uten å sende", async () => {
    vi.mocked(Placeholdere.hentVerdier).mockResolvedValue({ verdier: [{ nokkel: "saksnummer", verdi: "MEL-22" }] });

    renderSendBrev();
    await klikkSendBrev();

    fireEvent.click(await screen.findByRole("button", { name: "Avbryt" }));

    await waitFor(() => expect(screen.queryByText("Noen innsatte verdier er utdaterte")).not.toBeInTheDocument());
    expect(Api.DokumenterV2.opprettBrev).not.toHaveBeenCalled();
  });

  it("sender direkte når de innsatte verdiene fortsatt stemmer", async () => {
    vi.mocked(Placeholdere.hentVerdier).mockResolvedValue({ verdier: [{ nokkel: "saksnummer", verdi: "MEL-21" }] });

    renderSendBrev();
    await klikkSendBrev();

    await ventPaaBestilt();
    expect(screen.queryByText("Noen innsatte verdier er utdaterte")).not.toBeInTheDocument();
  });

  it("sender uten varsel når ferske verdier ikke kan hentes", async () => {
    vi.mocked(Placeholdere.hentVerdier).mockRejectedValue(new Error("nede"));

    renderSendBrev();
    await klikkSendBrev();

    await ventPaaBestilt();
    expect(screen.queryByText("Noen innsatte verdier er utdaterte")).not.toBeInTheDocument();
  });

  it("slår ikke opp ferske verdier for fritekst som ikke er med i bestillingen", async () => {
    vi.mocked(Api.DokumenterV2.hentTilgjengeligeMaler).mockResolvedValue([
      { mottaker, brevTyper: [{ ...brevType, felter: [{ ...brevType.felter[0], kode: "IKKE_I_BESTILLINGEN" }] }] },
    ] as any);
    renderWithProviders(<SendBrev behandlingID={123} redigerbart dokumenter={[]} />, {
      preloadedState: {
        ...preloadedState,
        form: {
          send_brev: {
            values: {
              ...preloadedState.form.send_brev.values,
              felt: { IKKE_I_BESTILLINGEN: { feltVerdi: FRITEKST_HTML } },
            },
          },
        },
      },
    });
    await klikkSendBrev();

    await ventPaaBestilt();
    expect(Placeholdere.hentVerdier).not.toHaveBeenCalled();
  });

  it("slår ikke opp ferske verdier når friteksten ikke har innsatte verdier", async () => {
    renderMedFritekst("<p>Saken er mottatt.</p>");
    await klikkSendBrev();

    await ventPaaBestilt();
    expect(Placeholdere.hentVerdier).not.toHaveBeenCalled();
  });

  it("varsler om uoppløste betingelser, uten å slå opp ferske verdier", async () => {
    renderMedFritekst("<p>{#hvis avslag}Avslag{/hvis}</p>");
    await klikkSendBrev();

    expect(await screen.findByText("Brevet inneholder uoppløste betingelser")).toBeInTheDocument();
    expect(screen.getByText(/må fjernes eller fylles ut manuelt/)).toBeInTheDocument();
    expect(screen.getByText("avslag")).toBeInTheDocument();
    expect(Placeholdere.hentVerdier).not.toHaveBeenCalled();
    expect(Api.DokumenterV2.opprettBrev).not.toHaveBeenCalled();
  });

  it("viser utdaterte verdier og uoppløste betingelser i samme varsel", async () => {
    vi.mocked(Placeholdere.hentVerdier).mockResolvedValue({ verdier: [{ nokkel: "saksnummer", verdi: "MEL-22" }] });

    renderMedFritekst(`${FRITEKST_HTML}<p>{#hvis avslag}Avslag{/hvis}</p>`);
    await klikkSendBrev();

    expect(await screen.findByText("Sjekk innholdet i brevet")).toBeInTheDocument();
    expect(screen.getByText("Saksnummer: innsatt MEL-21, nå MEL-22")).toBeInTheDocument();
    expect(screen.getByText("avslag")).toBeInTheDocument();
  });

  it("sender brevet med tokenene i behold når saksbehandler velger Send likevel", async () => {
    renderMedFritekst("<p>{#hvis avslag}Avslag{/hvis}</p>");
    await klikkSendBrev();

    fireEvent.click(await screen.findByRole("button", { name: "Send likevel" }));

    await ventPaaBestilt();
    expect(screen.queryByText("Brevet inneholder uoppløste betingelser")).not.toBeInTheDocument();
  });

  it("slår ikke opp ferske verdier når togglene er av", async () => {
    renderWithProviders(<SendBrev behandlingID={123} redigerbart dokumenter={[]} />, {
      preloadedState: { ...preloadedState, featureToggle: { status: STATUS.OK, data: {} } },
    });
    await klikkSendBrev();

    await ventPaaBestilt();
    expect(Placeholdere.hentVerdier).not.toHaveBeenCalled();
  });
});
