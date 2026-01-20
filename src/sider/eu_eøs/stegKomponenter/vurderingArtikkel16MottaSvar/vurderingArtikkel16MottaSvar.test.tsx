import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";

import MKV from "../../../../melosyskodeverk";

import { STATUS } from "../../../../services";

import VurderingArtikkel16MottaSvar from "./vurderingArtikkel16MottaSvar";
import * as KV from "../../../../kodeverk";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

describe("VurderingArtikkel16MottaSvar", () => {
  let props: any;
  let initialReduxState: any = null;
  const ConnectedVurderingArtikkel16MottaSvar = reduxForm({ form: KV.Form.ARTIKKEL_16_MOTTA_SVAR })(
    VurderingArtikkel16MottaSvar as any,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    props = {
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
      redigerbart: true,
      lovvalgsperiodeFom: "lovfom",
      lovvalgsperiodeTom: "lovtom",
      oppdaterData: vi.fn(),
      slettData: vi.fn(),
      tilstand: {},
    };

    initialReduxState = {
      mottatteOpplysninger: {
        data: {
          data: {
            periode: {
              fom: "2024-03-12",
              tom: "2024-03-31",
            },
          },
          soeknadsland: {
            landkoder: ["DK"],
          },
        },
        status: STATUS.OK,
      },
      avklartefakta: {
        data: [
          {
            referanse: KV.Koder.avklartefaktaKoder.SOKNADSLAND,
            subjektID: "DK",
          },
        ],
        status: STATUS.OK,
      },
      anmodningsperioder: {
        data: [
          {
            id: "5",
          },
        ],
        status: STATUS.OK,
      },
      anmodningsperiodesvar: {
        data: {
          endretPeriode: {
            fom: "2024-03-21",
            tom: "2024-06-01",
          },
          anmodningsperiodeSvarType: MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE,
          begrunnelseFritekst: "",
        },
        status: STATUS.OK,
      },
    };
  });

  it("viser ett Datoomrademedvarighet", async () => {
    const { getByText } = renderWithProviders(<ConnectedVurderingArtikkel16MottaSvar {...props} />, {
      preloadedState: initialReduxState,
    });

    await waitFor(() => {
      expect(getByText("0 måneder og 20 dager")).toBeInTheDocument();
    });
  });

  it("viser stegknapper", async () => {
    const { getByRole } = renderWithProviders(<ConnectedVurderingArtikkel16MottaSvar {...props} />, {
      preloadedState: initialReduxState,
    });

    await waitFor(() => {
      expect(getByRole("button", { name: "Bekreft og fortsett" })).toBeInTheDocument();
      expect(getByRole("button", { name: "Tilbake" })).toBeInTheDocument();
    });
  });

  it("viser en textarea ved delvis innvilgelse", async () => {
    initialReduxState.anmodningsperiodesvar.data.anmodningsperiodeSvarType =
      MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE;
    const { getByRole } = renderWithProviders(<ConnectedVurderingArtikkel16MottaSvar {...props} />, {
      preloadedState: initialReduxState,
    });

    await waitFor(() => {
      expect(getByRole("textbox", { name: "Begrunnelse" })).toBeInTheDocument();
    });
  });

  it("snapshot test", async () => {
    const { container } = renderWithProviders(<ConnectedVurderingArtikkel16MottaSvar {...props} />, {
      preloadedState: initialReduxState,
    });

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
