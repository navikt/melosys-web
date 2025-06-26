import { JournalforingValues } from "../../../kodeverk/form";
import MKV from "../../../melosyskodeverk";
import { KnyttTilSak } from "./knyttTilSak";
import { renderWithProvidersAsync } from "../../../ducks/test-utils/renderWithProviders";
import { screen, waitFor, within } from "@testing-library/react";
import { reduxForm } from "redux-form";

const mocks = vi.hoisted(() => {
  return {
    hent: vi.fn(),
    hentBehandlingstyperForKnyttTilSak: vi.fn(() => Promise.resolve([{ kode: "AARSAVREGNING", term: "Årsavregning" }])),
  };
});
vi.mock("../../../services/modules/anmodningsperioder", () => ({
  hent: () => Promise.resolve(mocks.hent()),
}));
vi.mock("../../../services/modules/lovligekombinasjoner", () => ({
  hentBehandlingstemaer: () => Promise.resolve([]),
  hentBehandlingstyperForKnyttTilSak: () => mocks.hentBehandlingstyperForKnyttTilSak(),
}));
describe("KnyttTilSak", () => {
  let props = null;

  beforeEach(() => {
    props = {
      sak: {
        sakstype: {
          kode: MKV.Koder.sakstyper.EU_EOS,
        },
        sakstema: {
          kode: MKV.Koder.sakstemaer.MEDLEMSKAP_LOVVALG,
        },
        saksstatus: {
          kode: MKV.Koder.saksstatuser.UNDER_BEHANDLING,
        },
        saksnummer: "123",
        behandlingOversikter: [
          {
            behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET },
            behandlingstype: { kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG },
            behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV },
            behandlingID: 1,
          },
        ],
      },
      formValues: {
        opprettBehandling: null,
        behandlingstema: null,
        behandlingstype: null,
        journalforingGjelder: MKV.Koder.aktoersroller.BRUKER,
      },
      feltNavn: JournalforingValues,
      changeField: vi.fn(),
      erJournalføring: true,
    };
    mocks.hent.mockReset();
  });

  const WrappedKnyttTilSak = reduxForm({ form: "test" })(KnyttTilSak);

  it(`Vis komponent for knytte til eksisterende sak komponent og knapper for å opprette ny behandling dersom siste behandling er inaktiv`, async () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET };

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...props} />);

    expect(screen.getByText("Tidligere behandling er avsluttet.")).toBeInTheDocument();
    expect(screen.getByText("Velg hva du vil gjøre med dokumentet")).toBeInTheDocument();
    const radiogruppe = screen.getByRole("group");
    expect(radiogruppe).toBeInTheDocument();
    expect(within(radiogruppe).queryAllByRole("radio")).toHaveLength(2);
    expect(within(radiogruppe).getByLabelText("Opprett ny behandling")).toBeInTheDocument();
  });

  it(`Ikke vis knytt til eksisterende sak komponent dersom siste behandling er aktiv`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };

    renderWithProvidersAsync(<WrappedKnyttTilSak {...props} />);

    expect(screen.queryByText("Velg hva du vil gjøre med dokumentet")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
  });

  it(`Ikke vis knytt til eksisterende sak komponent dersom status er henlagt`, async () => {
    props.sak.saksstatus.kode = MKV.Koder.saksstatuser.HENLAGT;
    props.erJournalføring = false;

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...props} />);

    expect(screen.queryByText("Velg hva du vil gjøre med dokumentet")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.getByText(/Du kan ikke opprette en ny behandling/i)).toBeInTheDocument();
  });

  it(`Vis vurder dokument dersom man er i journalføring-kontekst`, async () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.erJournalføring = true;

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...props} />);

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByText(`Oppdater behandlingsstatus til "Vurder dokument"`)).toBeInTheDocument();
  });

  it(`Ikke vis vurder dokument dersom man er i opprett ny sak/behandling-kontekst`, async () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.erJournalføring = false;

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...props} />);

    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByText(`Oppdater behandlingsstatus til "Vurder dokument"`)).toBeNull();
    expect(screen.getByText(/Du kan ikke opprette en ny behandling/i)).toBeInTheDocument();
  });

  it(`Vis varselmelding om anmodning om unntak dersom siste behandling er pågående artikkel 16 sak`, async () => {
    mocks.hent.mockReturnValueOnce({ anmodningsperioder: [{ sendtUtland: true }] });
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...props} />);

    await waitFor(() => expect(mocks.hent).toHaveBeenCalledOnce());
    expect(screen.getByText(/Hvis du har mottatt svar på anmodning om unntak skal du/i)).toBeInTheDocument();
  });

  it(`Ikke vis varselmelding om anmodning om unntak dersom siste behandling er avsluttet artikkel 16 sak`, async () => {
    mocks.hent.mockReturnValueOnce({ anmodningsperioder: [{ sendtUtland: true }] });
    props.sak.behandlingOversikter[0].behandlingsstatus = { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET };

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...props} />);

    await waitFor(() => expect(mocks.hent).toHaveBeenCalledOnce());
    expect(screen.queryByText(/Hvis du har mottatt svar på anmodning om unntak skal du/i)).toBeNull();
    expect(screen.getByText("Tidligere behandling er avsluttet.")).toBeInTheDocument();
  });

  it("viser behandlingstypevalg når behandlingstema er valgt", async () => {
    props.formValues.behandlingstema = "YRKESAKTIV";
    props.formValues.opprettBehandling = true;

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...props} />);

    await waitFor(() => expect(mocks.hentBehandlingstyperForKnyttTilSak).toHaveBeenCalled());
    expect(screen.getByText("Behandlingstype")).toBeInTheDocument();

    const behandlingstypeGroup = screen.getByRole("group", { name: "Behandlingstype" });
    const radioButtons = within(behandlingstypeGroup).getAllByRole("radio");
    expect(radioButtons).toHaveLength(1);
    expect(within(behandlingstypeGroup).getByLabelText("Årsavregning")).toBeInTheDocument();
  });

  it("håndterer feil ved henting av behandlingstyper", async () => {
    mocks.hentBehandlingstyperForKnyttTilSak.mockRejectedValueOnce(new Error("API Error"));
    props.formValues.behandlingstema = "YRKESAKTIV";
    props.formValues.opprettBehandling = true;

    await renderWithProvidersAsync(<WrappedKnyttTilSak {...props} />);

    await waitFor(() => {
      expect(mocks.hentBehandlingstyperForKnyttTilSak).toHaveBeenCalled();
      const behandlingstypeGroup = screen.queryByRole("group", { name: "Behandlingstype" });
      if (behandlingstypeGroup) {
        expect(within(behandlingstypeGroup).queryAllByRole("radio")).toHaveLength(0);
      }
    });
  });
});
