import { describe, it, expect, vi, beforeEach } from "vitest";

import { reduxForm } from "redux-form";
import * as KV from "../../../../kodeverk";
import VurderingVideresend from "./vurderingVideresend";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

const initialReduxState = {
  behandlinger: {
    data: {
      behandlingID: 4,
    },
  },
  avklartefakta: {
    data: [
      {
        referanse: KV.Koder.avklartefaktaKoder.BOSTEDSLAND,
        fakta: ["SE"],
      },
    ],
  },
  dokumenter: {
    data: {
      dokumentOversikt: [],
    },
  },
};

describe("Vurderingvideresend", () => {
  let props: any;
  const WrappedVurderingVideresend = reduxForm({ form: KV.Form.VURDERING_VIDERESEND })(VurderingVideresend as any);

  beforeEach(() => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    );
    global.fetch = mockFetch as any;

    props = {
      redigerbart: true,
      videresendSoknad: vi.fn(),
      tilbake: vi.fn(),
      handleSubmit: vi.fn(),
    };
  });

  it("viser fritekst til orienteringsbrev", () => {
    const { getByRole } = renderWithProviders(<WrappedVurderingVideresend {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(getByRole("textbox", { name: "Fritekst til orienteringsbrev" })).toBeInTheDocument();
  });

  it("viser en dokumentliste med forventet innhold", () => {
    const { getByText } = renderWithProviders(<WrappedVurderingVideresend {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(getByText("SED A008")).toBeInTheDocument();
  });

  it("viser ikke dokumentliste dersom ikke redigerbart", () => {
    props.redigerbart = false;
    const { queryByText } = renderWithProviders(<WrappedVurderingVideresend {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(queryByText("SED A008")).not.toBeInTheDocument();
  });
});
