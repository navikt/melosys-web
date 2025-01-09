import { reduxForm } from "redux-form";
import { VurderingAarsavregning } from "./vurderingAarsavregning";
import { STATUS } from "../../../../services";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

describe("VurderingAarsavreging", () => {
  const initialReduxState = {
    behandlinger: {
      data: {
        behandlingID: 4,
        oppsummering: {},
        redigerbart: true,
      },
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
    },
    fagsaker: {
      data: {
        saksnummer: "333",
        sakstype: {},
      },
      status: STATUS.OK,
    },
  };
  const props = {
    bekreft: vi.fn(),
    oppdaterStatus: vi.fn(),
  };
  // @ts-expect-error generisk beskrivelse
  const WrappedVurderingAarsavregning = reduxForm({ form: "test" })(VurderingAarsavregning);

  beforeEach(() => {
    // @ts-expect-error generisk beskrivelse
    fetch.resetMocks();
    // @ts-expect-error generisk beskrivelse
    fetch.mockResponse(JSON.stringify({}));
  });

  describe("VurderingAarsavregning", () => {
    it("snapshot test", () => {
      const { container } = renderWithProviders(<WrappedVurderingAarsavregning {...props} />, {
        // @ts-expect-error generisk beskrivelse
        preloadedState: initialReduxState,
      });
      expect(container).toMatchSnapshot();
    });
  });
});
