import { JOURNALFORING_VALUES } from "../../../kodeverk/form";
import MKV from "../../../melosyskodeverk";
import { KnyttTilSak } from "./knyttTilSak";
import { renderWithProviders } from "~/ducks/test-utils/renderWithProviders";
import { screen, within } from "@testing-library/react";
import { reduxForm } from "redux-form";

vi.mock("../../../services/modules/anmodningsperioder", () => ({
  hent: () => Promise.resolve([]),
}));
vi.mock("../../../services/modules/lovligekombinasjoner", () => ({
  hentBehandlingstemaer: () => Promise.resolve([]),
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
      feltNavn: JOURNALFORING_VALUES,
      journalforingGjelder: MKV.Koder.aktoersroller.BRUKER,
      behandlingstyper: [],
      opprettBehandling: false,
      behandlingstema: "",
      behandlingstype: "",
      changeField: vi.fn(),
      erJournalføring: true,
    };
  });

  const WrappedKnyttTilSak = reduxForm({ form: "test" })(KnyttTilSak);

  it(`Vis komponent for knytte til eksisterende sak komponent og knapper for å opprette ny behandling dersom siste behandling er inaktiv`, () => {
    props.sak.behandlingOversikter[0].behandlingsstatus = { kode: MKV.Koder.behandlinger.behandlingsstatus.AVSLUTTET };

    renderWithProviders(<WrappedKnyttTilSak {...props} />);

    expect(
      screen.getByText("Tidligere behandling er avsluttet. Velg hva du vil gjøre med dokumentet")
    ).toBeInTheDocument();
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

    expect(screen.queryByText("Tidligere behandling er avsluttet. Velg hva du vil gjøre med dokumentet")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
  });

  it(`Ikke vis knytt til eksisterende sak komponent dersom status er henlagt`, () => {
    props.sak.saksstatus.kode = MKV.Koder.saksstatuser.HENLAGT;
    props.erJournalføring = false;

    renderWithProviders(<WrappedKnyttTilSak {...props} />);

    expect(screen.queryByText("Tidligere behandling er avsluttet. Velg hva du vil gjøre med dokumentet")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
    const henlagtTekst = "Du kan ikke opprette en ny behandling på eksisterende sak som er henlagt/bortfalt i Melosys";
    expect(screen.getByText(henlagtTekst)).toBeInTheDocument();
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
    expect(
      screen.getByText("Du kan ikke opprette en ny behandling på eksisterende sak med en aktiv/pågående behandling")
    ).toBeInTheDocument();
  });
});
