import { JournalforingValues } from "../../../kodeverk/form";
import MKV from "../../../melosyskodeverk";
import { KnyttTilSak } from "./knyttTilSak";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";
import { screen, waitFor, within } from "@testing-library/react";
import { reduxForm } from "redux-form";

const mocks = vi.hoisted(() => {
  return {
    hent: vi.fn(),
  };
});
vi.mock("../../../services/modules/anmodningsperioder", () => ({
  hent: () => Promise.resolve(mocks.hent()),
}));
vi.mock("../../../services/modules/lovligekombinasjoner", () => ({
  hentBehandlingstemaer: () => Promise.resolve([]),
  hentBehandlingstyperForKnyttTilSak: () => Promise.resolve([]),
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
        behandlingOversikter: [
          {
            behandlingsstatus: { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET },
            behandlingstype: { kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG },
            behandlingstema: { kode: MKV.Koder.behandlinger.behandlingstema.YRKESAKTIV },
          },
        ],
      },
      formValues: {
        opprettBehandling: null,
        behandlingstema: null,
        behandlingstype: null,
        journalforingGjelder: null,
      },
      feltNavn: JournalforingValues,
      journalforingGjelder: MKV.Koder.aktoersroller.BRUKER,
      behandlingstyper: [],
      opprettBehandling: false,
      behandlingstema: undefined,
      behandlingstype: "",
      changeField: vi.fn(),
      erJournalføring: true,
    };
    mocks.hent.mockReset();
  });

  const WrappedKnyttTilSak = reduxForm({ form: "test" })(KnyttTilSak);

  it(`Vis komponent for knytte til eksisterende sak komponent og knapper for å opprette ny behandling dersom siste behandling er inaktiv`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET };

    renderWithProviders(<WrappedKnyttTilSak {...props} />);

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

    renderWithProviders(<WrappedKnyttTilSak {...props} />);

    expect(screen.queryByText("Velg hva du vil gjøre med dokumentet")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
  });

  it(`Ikke vis knytt til eksisterende sak komponent dersom status er henlagt`, () => {
    props.sak.saksstatus.kode = MKV.Koder.saksstatuser.HENLAGT;
    props.erJournalføring = false;

    renderWithProviders(<WrappedKnyttTilSak {...props} />);

    expect(screen.queryByText("Velg hva du vil gjøre med dokumentet")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.getByText(/Du kan ikke opprette en ny behandling/i)).toBeInTheDocument();
  });

  it(`Vis vurder dokument dersom man er i journalføring-kontekst`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.erJournalføring = true;

    renderWithProviders(<WrappedKnyttTilSak {...props} />);

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByText(`Oppdater behandlingsstatus til "Vurder dokument"`)).toBeInTheDocument();
  });

  it(`Ikke vis vurder dokument dersom man er i opprett ny sak/behandling-kontekst`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };
    props.erJournalføring = false;

    renderWithProviders(<WrappedKnyttTilSak {...props} />);

    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByText(`Oppdater behandlingsstatus til "Vurder dokument"`)).toBeNull();
    expect(screen.getByText(/Du kan ikke opprette en ny behandling/i)).toBeInTheDocument();
  });

  it(`Vis varselmelding om anmodning om unntak dersom siste behandling er pågående artikkel 16 sak`, async () => {
    mocks.hent.mockReturnValueOnce({ anmodningsperioder: [{ sendtUtland: true }] });
    props.sak.behandlingOversikter[0].behandlingsstatus = {
      kode: MKV.Koder.behandlinger.behandlingsstatus.UNDER_BEHANDLING,
    };

    renderWithProviders(<WrappedKnyttTilSak {...props} />);

    await waitFor(() => expect(mocks.hent).toHaveBeenCalledOnce());
    expect(screen.getByText(/Hvis du har mottatt svar på anmodning om unntak skal du/i)).toBeInTheDocument();
  });

  it(`Ikke vis varselmelding om anmodning om unntak dersom siste behandling er avsluttet artikkel 16 sak`, async () => {
    mocks.hent.mockReturnValueOnce({ anmodningsperioder: [{ sendtUtland: true }] });
    props.sak.behandlingOversikter[0].behandlingsstatus = { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET };

    renderWithProviders(<WrappedKnyttTilSak {...props} />);

    await waitFor(() => expect(mocks.hent).toHaveBeenCalledOnce());
    expect(screen.queryByText(/Hvis du har mottatt svar på anmodning om unntak skal du/i)).toBeNull();
    expect(screen.getByText("Tidligere behandling er avsluttet.")).toBeInTheDocument();
  });

  it("viser behandlingstypevalg når behandlingstema er undefined", async () => {
    props.behandlingstema = undefined;
    renderWithProviders(<WrappedKnyttTilSak {...props} />);

    const radiogruppe = screen.getByRole("group");
    expect(radiogruppe).toBeInTheDocument();
    expect(within(radiogruppe).queryAllByRole("radio")).toHaveLength(2);
    expect(within(radiogruppe).getByLabelText("Opprett ny behandling")).toBeInTheDocument();
  });
});
