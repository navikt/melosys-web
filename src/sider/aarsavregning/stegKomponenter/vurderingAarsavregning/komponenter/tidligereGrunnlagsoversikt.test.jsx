import { reduxForm } from "redux-form";

import MKV from "../../../../../melosyskodeverk";
import { STATUS } from "../../../../../services";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";
import { VurderingAarsavregningInngang } from "../vurderingAarsavregningInngang";

describe("TidligereGrunnlagsoversikt", () => {
  const initialReduxState = {
    behandlinger: {
      data: {
        behandlingID: 4,
        oppsummering: {},
        redigerbart: true,
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
  const { IKKE_SKATTEPLIKTIG } = MKV.Koder.skatteplikttype;
  const props = {
    erBrukerPliktigMedlemOgSkattepliktig: false,
    skatteforholdsperioder: [
      {
        fomDato: "01.01.2023",
        tomDato: "01.03.2023",
        skatteplikttype: IKKE_SKATTEPLIKTIG,
      },
    ],
    inntektsperioder: [],
    avgift: {
      trygdeavgiftsperioder: [],
      totalInntekt: 0,
      totalAvgift: 0,
    },
  };
  // @ts-expect-error generisk beskrivelse
  const WrappedVurderingAarsavregningInngang = reduxForm({ form: "test" })(VurderingAarsavregningInngang);

  beforeEach(() => {
    // @ts-expect-error generisk beskrivelse
    fetch.resetMocks();
    // @ts-expect-error generisk beskrivelse
    fetch.mockResponse(JSON.stringify({}));
  });

  it("snapshot test", () => {
    const { container } = renderWithProviders(<WrappedVurderingAarsavregningInngang {...props} />, {
      // @ts-expect-error generisk beskrivelse
      preloadedState: initialReduxState,
    });
    expect(container).toMatchSnapshot();
  });
});
