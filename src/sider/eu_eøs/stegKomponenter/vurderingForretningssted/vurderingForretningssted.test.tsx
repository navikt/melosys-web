import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import MKV from "../../../../melosyskodeverk";

import VurderingForretningssted from "./vurderingForretningssted";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

describe("VurderingForretningssted", () => {
  const WrappedVurderingForretningssted = reduxForm({ form: "test" })(VurderingForretningssted);
  const props = {
    bekreftOgFortsett: vi.fn(),
    tilbake: vi.fn(),
    tilstand: {
      omfattetINorge: {},
      omfattetILand: {},
      lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1B,
      avklarteForretningsland: [],
      harAvklaring: false,
    },
    valgteVirksomheter: [
      {
        virksomhetId: "1",
        navn: "NAV",
      },
    ],
    redigerbart: true,
    oppdaterData: vi.fn(),
    slettData: vi.fn(),
  };

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedVurderingForretningssted {...props} />);
    expect(container).toMatchSnapshot();
  });
});
