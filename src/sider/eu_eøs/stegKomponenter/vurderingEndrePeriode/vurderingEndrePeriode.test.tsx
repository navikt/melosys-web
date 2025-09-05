import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

import VurderingEndrePeriode from "./vurderingEndrePeriode";
import { lagAvklartfakta } from "../../../../felleskomponenter/stegvelger";
import { STATUS } from "../../../../services";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

describe("vurderingEndrePeriode", () => {
  let props: any;
  let initialReduxState: any = null;
  const WrappedVurderingEndrePeriode = reduxForm({ form: "test" })(VurderingEndrePeriode);

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    props = {
      behandlingID: 1,
      endreLovvalgsperioderHandler: vi.fn(),
      endreVedtak: vi.fn(),
      tilForsiden: vi.fn(),
      tilbake: vi.fn(),
      tilstand: {
        aarsakEndringPeriodeAvklartfakta: lagAvklartfakta("a", "b", "c", [], null),
      },
      oppdaterData: vi.fn(),
      oppdaterPeriode: vi.fn(),
      slettData: vi.fn(),
      soknadsland: ["SE"],
    };

    initialReduxState = {
      behandlinger: {
        data: {
          behandlingID: 1,
          redigerbart: true,
        },
        status: STATUS.OK,
      },
      lovvalgsperioder: {
        data: [{}],
        status: STATUS.OK,
      },
    };
  });

  it("viser en dokumentliste", () => {
    const { getByText } = renderWithProviders(<WrappedVurderingEndrePeriode {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(getByText("SED A009")).toBeInTheDocument();
  });

  it("viser StegKnapper", () => {
    const { getByRole } = renderWithProviders(<WrappedVurderingEndrePeriode {...props} />, {
      preloadedState: initialReduxState,
    });

    expect(getByRole("button", { name: "Fatt vedtak" })).toBeInTheDocument();
  });

  it("viser to datofelt for fradato og tildato", () => {
    const { getByRole } = renderWithProviders(<WrappedVurderingEndrePeriode {...props} />, {
      preloadedState: initialReduxState,
    });

    expect(getByRole("textbox", { name: "Startdato" })).toBeInTheDocument();
    expect(getByRole("textbox", { name: "Sluttdato" })).toBeInTheDocument();
  });
});
