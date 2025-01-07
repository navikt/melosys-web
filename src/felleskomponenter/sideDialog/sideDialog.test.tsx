import SideDialog from "./sideDialog";
import MKV from "../../melosyskodeverk";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import { reduxForm } from "redux-form";
import { STATUS } from "../../services";

describe("SideDialog", () => {
  const initialReduxState = {
    behandlinger: {
      data: {
        behandlingID: 4,
        oppsummering: {
          behandlingstema: MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
        },
        redigerbart: true,
      },
      status: STATUS.OK,
    },
    dokumenter: {
      data: {
        dokumentOversikt: [
          {
            journalpostID: "321",
            journalforingDato: null,
            mottattDato: null,
            avsenderEllerMottaker: "avsendernavn",
            mottaksretning: { kode: "INN", term: "Inngående" },
            hoveddokument: {
              tittel: "tittel",
              dokumentID: "123",
              logiskeVedlegg: [],
            },
            vedlegg: [],
          },
        ],
      },
      status: STATUS.OK,
    },
    fagsaker: {
      data: {
        saksnummer: "333",
        sakstype: {
          kode: MKV.Koder.sakstyper.EU_EOS,
        },
      },
      status: STATUS.OK,
    },
  };
  // @ts-expect-error generisk beskrivelse
  const WrappedSideDialog = reduxForm({ form: "test" })(SideDialog);

  beforeEach(() => {
    // @ts-expect-error generisk beskrivelse
    fetch.resetMocks();
    // @ts-expect-error generisk beskrivelse
    fetch.mockResponse(JSON.stringify({}));
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedSideDialog />, { preloadedState: initialReduxState });
    expect(container).toMatchSnapshot();
  });
});
