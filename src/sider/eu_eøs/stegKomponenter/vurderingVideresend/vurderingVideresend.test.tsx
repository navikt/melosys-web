import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { reduxForm } from "redux-form";
import * as KV from "../../../../kodeverk";
import { VurderingVideresend } from "./vurderingVideresend";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import { STATUS } from "../../../../services";
import { MELOSYS_CDM_4_4 } from "../../../../featuretoggle/toggleNavn";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurderingVideresendSchema from "../vurderingVideresendSchema";

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

  describe("videresendSoknad kall", () => {
    it("sender ytterligereInformasjonSed og a008Formaal når toggle er på", async () => {
      const videresendSoknad = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      // Mock handleSubmit to call the passed function with form values
      const handleSubmit = (submitFn: any) => (e: any) => {
        e?.preventDefault?.();
        return submitFn(
          {
            mottakerinstitusjon: "SE:123",
            orienteringsbrevFritekst: "Orienteringstekst",
            ytterligereInformasjonSed: "Tilleggsinformasjon for A008",
          },
          vi.fn(),
          { videresendSoknad },
        );
      };

      renderWithProviders(
        <WrappedVurderingVideresend {...props} videresendSoknad={videresendSoknad} handleSubmit={handleSubmit} />,
        {
          preloadedState: reduxStateWithA008Cdm44Toggle,
        },
      );

      await user.click(screen.getByRole("button", { name: /Videresend søknad/i }));

      await waitFor(() => {
        expect(videresendSoknad).toHaveBeenCalledWith(
          "SE:123",
          "Orienteringstekst",
          "Tilleggsinformasjon for A008",
          "arbeid_flere_land",
          [],
        );
      });
    });

    it("sender null for ytterligereInformasjonSed og a008Formaal når toggle er av", async () => {
      const videresendSoknad = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      const handleSubmit = (submitFn: any) => (e: any) => {
        e?.preventDefault?.();
        return submitFn(
          {
            mottakerinstitusjon: "SE:123",
            orienteringsbrevFritekst: "Orienteringstekst",
            ytterligereInformasjonSed: "Dette skal ignoreres",
          },
          vi.fn(),
          { videresendSoknad },
        );
      };

      renderWithProviders(
        <WrappedVurderingVideresend {...props} videresendSoknad={videresendSoknad} handleSubmit={handleSubmit} />,
        {
          preloadedState: initialReduxState,
        },
      );

      await user.click(screen.getByRole("button", { name: /Videresend søknad/i }));

      await waitFor(() => {
        expect(videresendSoknad).toHaveBeenCalledWith("SE:123", "Orienteringstekst", null, null, []);
      });
    });

    it("sender tom streng som ytterligereInformasjonSed når feltet er tomt og toggle er på", async () => {
      const videresendSoknad = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      const handleSubmit = (submitFn: any) => (e: any) => {
        e?.preventDefault?.();
        return submitFn(
          {
            mottakerinstitusjon: "SE:123",
            orienteringsbrevFritekst: "Orienteringstekst",
            ytterligereInformasjonSed: "",
          },
          vi.fn(),
          { videresendSoknad },
        );
      };

      renderWithProviders(
        <WrappedVurderingVideresend {...props} videresendSoknad={videresendSoknad} handleSubmit={handleSubmit} />,
        {
          preloadedState: reduxStateWithA008Cdm44Toggle,
        },
      );

      await user.click(screen.getByRole("button", { name: /Videresend søknad/i }));

      await waitFor(() => {
        expect(videresendSoknad).toHaveBeenCalledWith("SE:123", "Orienteringstekst", "", "arbeid_flere_land", []);
      });
    });
  });

  describe("validering av tekstfeltene", () => {
    const ValidertVurderingVideresend = reduxForm({
      form: KV.Form.VURDERING_VIDERESEND,
      validate: lagYupToReduxformErrorMapper(vurderingVideresendSchema),
    })(VurderingVideresend as any);

    const renderValidertSkjema = () =>
      renderWithProviders(<ValidertVurderingVideresend {...props} />, {
        preloadedState: reduxStateWithA008Cdm44Toggle,
      });

    const videresendKnapp = () => screen.getByRole("button", { name: /Videresend søknad/i });

    it("har videresend-knappen aktiv når begge tekstfeltene er innenfor grensene", () => {
      renderValidertSkjema();

      expect(videresendKnapp()).toBeEnabled();
    });

    it("deaktiverer videresend-knappen når ytterligere informasjon er over 500 tegn", async () => {
      renderValidertSkjema();

      fireEvent.change(screen.getByRole("textbox", { name: /Ytterligere informasjon/ }), {
        target: { value: "a".repeat(501) },
      });

      await waitFor(() => expect(videresendKnapp()).toBeDisabled());
    });

    it("deaktiverer videresend-knappen når fritekst til orienteringsbrev er over 4000 tegn", async () => {
      renderValidertSkjema();

      fireEvent.change(screen.getByRole("textbox", { name: "Fritekst til orienteringsbrev" }), {
        target: { value: "a".repeat(4001) },
      });

      await waitFor(() => expect(videresendKnapp()).toBeDisabled());
    });

    it("viser feilmelding for ytterligere informasjon først når feltet mister fokus", async () => {
      renderValidertSkjema();
      const felt = screen.getByRole("textbox", { name: /Ytterligere informasjon/ });

      fireEvent.focus(felt);
      fireEvent.change(felt, { target: { value: "a".repeat(501) } });

      await waitFor(() => expect(videresendKnapp()).toBeDisabled());
      expect(screen.queryByText("Du kan ikke skrive mer enn 500 tegn")).not.toBeInTheDocument();

      fireEvent.blur(felt);

      expect(await screen.findByText("Du kan ikke skrive mer enn 500 tegn")).toBeInTheDocument();
    });

    it("viser feilmelding for fritekst til orienteringsbrev først når feltet mister fokus", async () => {
      renderValidertSkjema();
      const felt = screen.getByRole("textbox", { name: "Fritekst til orienteringsbrev" });

      fireEvent.focus(felt);
      fireEvent.change(felt, { target: { value: "a".repeat(4001) } });

      await waitFor(() => expect(videresendKnapp()).toBeDisabled());
      expect(screen.queryByText("Du kan ikke skrive mer enn 4000 tegn")).not.toBeInTheDocument();

      fireEvent.blur(felt);

      expect(await screen.findByText("Du kan ikke skrive mer enn 4000 tegn")).toBeInTheDocument();
    });
  });
});
