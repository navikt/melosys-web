import VurderingAvslaaUtpeking from "./vurderingAvslaaUtpeking";
import { reduxForm } from "redux-form";
import * as KV from "../../../kodeverk";
import { renderWithProviders } from "../../../ducks/test-utils/renderWithProviders";

vi.mock("../../../utils", async () => {
  const actual = await vi.importActual("../../../utils");
  return {
    ...actual,
    _uuid: () => "123",
  };
});

describe("VurderingAvslaaUtpeking", () => {
  let props = null;
  const WrappedVurderingAvslaaUtpeking = reduxForm({ form: KV.Form.AVSLAA_UTPEKING })(VurderingAvslaaUtpeking);
  const initialReduxState = {
    behandlinger: {
      data: {
        behandlingID: 4,
      },
    },
    form: {
      [KV.Form.AVSLAA_UTPEKING]: {
        fritekst: "Test",
        nyttLovvalgsland: "CZ",
        begrunnelseUtenlandskMyndighet: "Begrunnelse",
        vilSendeAnmodningOmMerInformasjon: true,
      },
    },
  };

  beforeEach(() => {
    props = {
      redigerbart: true,
      handleSubmit: vi.fn(),
      avvisUtpeking: vi.fn(),
      tilbake: vi.fn(),
      touchAll: vi.fn(),
    };
  });

  it("viser to textarea for begrunnelser", () => {
    const { getAllByRole } = renderWithProviders(<WrappedVurderingAvslaaUtpeking {...props} />, {
      preloadedState: initialReduxState,
    });

    expect(getAllByRole("textbox")).toHaveLength(2);
  });

  it("viser radioknapper", () => {
    const { getAllByRole, getByLabelText } = renderWithProviders(<WrappedVurderingAvslaaUtpeking {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(getAllByRole("radio")).toHaveLength(2);
    expect(getByLabelText("Ja")).toBeInTheDocument();
    expect(getByLabelText("Nei")).toBeInTheDocument();
  });

  it("viser en landvelger", () => {
    const { getByLabelText } = renderWithProviders(<WrappedVurderingAvslaaUtpeking {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(getByLabelText("Foreslå nytt lovvalgsland (valgfri)")).toBeInTheDocument();
  });

  it("viser en dokumentliste", () => {
    const { getByRole, getByText } = renderWithProviders(<WrappedVurderingAvslaaUtpeking {...props} />, {
      preloadedState: initialReduxState,
    });
    expect(getByRole("table")).toBeInTheDocument();
    expect(getByText("Forhåndsvisning av brev")).toBeInTheDocument();
  });

  it("viser en knapp for å avslutte behandling", () => {
    const { getByRole } = renderWithProviders(<WrappedVurderingAvslaaUtpeking {...props} />, {
      preloadedState: initialReduxState,
    });

    expect(getByRole("button", { name: "Avslutt og send SED" })).toBeInTheDocument();
  });
});
