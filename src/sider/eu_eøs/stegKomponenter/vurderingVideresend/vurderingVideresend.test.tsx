import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import { reduxForm } from "redux-form";
import * as KV from "../../../../kodeverk";
import { VurderingVideresend } from "./vurderingVideresend";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import { STATUS } from "../../../../services";
import { MELOSYS_CDM_4_4 } from "../../../../featuretoggle/toggleNavn";

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

const reduxStateWithA008Cdm44Toggle = {
  ...initialReduxState,
  featureToggle: {
    status: STATUS.OK,
    data: {
      [MELOSYS_CDM_4_4]: true,
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
      resetFeiletRespons: vi.fn(),
    };
  });

  it("viser fritekst til orienteringsbrev", () => {
    const { getByRole } = renderWithProviders(<WrappedVurderingVideresend {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(getByRole("textbox", { name: "Fritekst til orienteringsbrev" })).toBeInTheDocument();
  });

  it("viser ytterligere informasjon tekstfelt når toggle er på", () => {
    const { getByRole } = renderWithProviders(<WrappedVurderingVideresend {...props} />, {
      preloadedState: reduxStateWithA008Cdm44Toggle,
    });
    expect(getByRole("textbox", { name: /Ytterligere informasjon/ })).toBeInTheDocument();
  });

  it("viser ikke ytterligere informasjon tekstfelt når toggle er av", () => {
    const { queryByRole } = renderWithProviders(<WrappedVurderingVideresend {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(queryByRole("textbox", { name: /Ytterligere informasjon/ })).not.toBeInTheDocument();
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

  it("kaller resetFeiletRespons ved mount", () => {
    const resetFeiletRespons = vi.fn();
    props.resetFeiletRespons = resetFeiletRespons;

    renderWithProviders(<WrappedVurderingVideresend {...props} />, {
      preloadedState: initialReduxState,
    });

    expect(resetFeiletRespons).toHaveBeenCalledTimes(1);
  });

  it("kaller resetFeiletRespons når vedleggvelger åpnes", async () => {
    const resetFeiletRespons = vi.fn();
    props.resetFeiletRespons = resetFeiletRespons;

    renderWithProviders(<WrappedVurderingVideresend {...props} />, {
      preloadedState: initialReduxState,
    });

    // Nullstill mock etter mount-kallet
    resetFeiletRespons.mockClear();

    // Klikk på "Legg til vedlegg" for å åpne vedleggvelgeren
    await userEvent.click(document.querySelector(".vedleggvelger") as HTMLElement);

    expect(resetFeiletRespons).toHaveBeenCalledTimes(1);
  });
});
