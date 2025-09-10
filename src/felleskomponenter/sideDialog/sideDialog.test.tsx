import SideDialog from "./sideDialog";
import MKV from "../../melosyskodeverk";
import { renderWithProviders } from "../../ducks/test-utils/renderWithProviders";
import { reduxForm } from "redux-form";
import { STATUS } from "../../services";

import { describe, it, expect, vi, beforeEach } from "vitest";

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
  const WrappedSideDialog = reduxForm({ form: "test" })(SideDialog as any);

  beforeEach(() => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );
    global.fetch = mockFetch as any;
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedSideDialog />, { preloadedState: initialReduxState });
    expect(container).toMatchSnapshot();
  });
});
