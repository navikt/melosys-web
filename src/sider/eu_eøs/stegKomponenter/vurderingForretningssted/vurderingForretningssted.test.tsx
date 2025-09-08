import { describe, it, expect, vi } from "vitest";

import MKV from "../../../../melosyskodeverk";

import VurderingForretningssted from "./vurderingForretningssted";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

describe("VurderingForretningssted", () => {
  const WrappedVurderingForretningssted = reduxForm({ form: "test" })(VurderingForretningssted as any);
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
    const { container } = renderWithProviders(<WrappedVurderingForretningssted {...(props as any)} />);
    expect(container).toMatchSnapshot();
  });
});
