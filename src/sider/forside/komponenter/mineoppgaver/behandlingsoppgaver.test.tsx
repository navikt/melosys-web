import { BehandlingOppgaver } from "./behandlingOppgaver";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../../featuretoggle", () => ({
  __esModule: true,
  useFeatureToggle: () => true,
}));

describe("Behandlingsoppgaver", () => {
  const saker = [
    {
      navn: "Peter Petersen",
      hovedpartIdent: "Z123456",
      oppgaveID: "174562068",
      sammensattNavn: "GLITRENDE HATT",
      fnr: "28106600300",
      saksnummer: "4",
      sakstype: {
        kode: "TRYGDEAVTALE",
        term: "Avtaleland",
      },
      sakstema: {
        kode: "MEDLEMDKAP_LOVVALG",
        term: "Medlemskap lovvalg",
      },
      behandling: {
        behandlingID: 4,
        behandlingstema: {
          kode: "YRKESAKTIV",
          term: "Yrkesaktiv",
        },
        behandlingstype: {
          kode: "FØRSTEGANG",
          term: "Førstegang",
        },
        behandlingsstatus: {
          kode: "UBEH",
          term: "Under behandling",
        },
        endretDato: "2018-08-10T15:00:00.622Z",
        erUnderOppdatering: false,
        registrertDato: "2018-12-11T16:30:00.622Z",
        svarFrist: "2019-12-11T16:30:00.622Z",
      },
      aktivTil: "2018-01-28",
      periode: {
        fom: "2018-10-01",
        tom: "2019-08-31",
      },
      prioritet: "HOY",
      land: {
        landkoder: ["NO"],
        flereLandUkjentHvilke: true,
      },
      versjon: 1,
      ansvarligID: "Z991001",
    },
  ];

  const props = {
    mineSaker: {
      saksbehandling: saker,
    },
    dispatch: vi.fn(),
    landkoder: [],
  };

  it("viser behandlingsoppgave", () => {
    const { container } = renderWithProviders(
      // Trenger en Router på toppnivå her siden vi bruker Link lengre ned.
      <MemoryRouter>
        <BehandlingOppgaver {...props} />
      </MemoryRouter>
    );

    expect(container).toMatchSnapshot();
  });
});
