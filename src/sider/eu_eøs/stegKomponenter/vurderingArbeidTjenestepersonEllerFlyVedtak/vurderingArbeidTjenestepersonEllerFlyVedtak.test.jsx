import VurderingArbeidTjenestepersonEllerFlyVedtakRedux from "./vurderingArbeidTjenestepersonEllerFlyVedtak";

import * as KV from "../../../../kodeverk";

import MKV from "../../../../melosyskodeverk";
import { STATUS } from "../../../../services";
import { reduxForm } from "redux-form";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import userEvent from "@testing-library/user-event";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import VurderingArbeidTjenestepersonEllerFlyVedtakSchema from "./vurderingArbeidTjenestepersonEllerFlyVedtakSchema";
import { fireEvent } from "@testing-library/react";

vi.mock("../../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));

vi.mock("../../../utils", async () => {
  const actual = await vi.importActual("../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

// TODO: Snapshot test.
//  For en full rewrite inkl. testene som ble slettet i denne committen anbefaler jeg å kopiere redux state fra lokalt
//  oppsett slik det er gjort i journalforingform.test.jsx
describe("VurderingArbeidTjenestepersonEllerFlyVedtak", () => {
  let props = null;
  let initialReduxState = null;
  const WrappedVurderingArbeidTjenestepersonEllerFlyVedtak = reduxForm({
    form: KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK,
    enableReinitialize: true,
    destroyOnUnmount: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
    validate: (values, ownProps) =>
      lagYupToReduxformErrorMapper(VurderingArbeidTjenestepersonEllerFlyVedtakSchema, {
        context: {
          soknadsperiode: ownProps.soknadsperiode,
          behandlingstype: ownProps.behandlingstype,
        },
      })(values),
    asyncBlurFields: [],
  })(VurderingArbeidTjenestepersonEllerFlyVedtakRedux);

  beforeEach(() => {
    props = {
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
      redigerbart: true,
      oppdaterData: vi.fn(),
      slettData: vi.fn(),
      arbeidsland: [],
      endreLovvalgsPeriode: vi.fn(),
      byggLovvalgsperioder: vi.fn(),
      lagreLovvalgsperioder: vi.fn(),
      handleSubmit: vi.fn(),
      harFeilmeldinger: false,
      kontrollerFerdigbehandling: vi.fn(),
      validerMottatteOpplysninger: vi.fn().mockImplementation(() => Promise.resolve()),
      fattVedtak: vi.fn(),
      informertMyndighetFakta: {
        subjektID: "DK",
      },
    };

    initialReduxState = {
      mottatteOpplysninger: {
        data: {
          data: {
            periode: {
              fom: "2024-03-12",
              tom: "2024-03-31",
            },
            selvstendigArbeid: {
              erSelvstendig: false,
            },
          },
          soeknadsland: {
            landkoder: ["DK"],
          },
        },
        status: STATUS.OK,
      },
      behandlinger: {
        data: {
          oppsummering: {
            behandlingstype: {
              kode: MKV.Koder.behandlinger.behandlingstyper.FØRSTEGANG,
              term: MKV.Terms.behandlinger.behandlingstyper.FØRSTEGANG,
            },
            behandlingstema: {
              kode: "",
              term: "",
            },
          },
          behandlingID: 4,
        },
        status: STATUS.OK,
      },
      fagsaker: {
        data: {
          sakstype: {
            kode: "",
            term: "",
          },
        },
        status: STATUS.OK,
      },
      lovvalgsperioder: {
        data: [
          {
            fom: "2024-03-12",
            tom: "2024-03-31",
          },
        ],
        status: STATUS.OK,
      },
      behandlingsresultat: {
        data: {
          begrunnelseKoder: [""],
          vedtakstype: MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
          begrunnelseFritekst: "",
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
    };
  });

  it.skip("snapshot test", async () => {
    const { container, getByRole, getByLabelText } = renderWithProviders(
      <WrappedVurderingArbeidTjenestepersonEllerFlyVedtak {...props} />,
      { preloadedState: initialReduxState }
    );
    const user = userEvent.setup();
    await user.click(getByRole("checkbox", { name: "Lovvalget innvilges for en kortere periode" }));
    const vedtaksbrevFritekstInput = getByLabelText("Fritekst til vedtaksbrev");
    fireEvent.change(vedtaksbrevFritekstInput, { target: { value: "vedtaksbrevfritekst" } });

    expect(container).toMatchSnapshot();
  });
});
