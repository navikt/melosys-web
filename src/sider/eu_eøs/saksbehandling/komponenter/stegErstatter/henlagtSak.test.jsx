import { screen } from "@testing-library/react";
import { renderWithProviders } from "~/ducks/test-utils/renderWithProviders";
import MKV from "../../../../../melosyskodeverk";
import Henlagtsak from "./henlagtSak";

describe("Henlagtsak", () => {
  let props = null;

  beforeEach(() => {
    props = {
      begrunnelseFritekst: null,
      begrunnelseKoder: [MKV.Koder.begrunnelser.henleggelsesgrunner.SOEKNADEN_TRUKKET],
    };
  });

  const initialState = () => ({
    behandlingsresultat: {
      status: "",
      data: {
        begrunnelseFritekst: props.begrunnelseFritekst,
        begrunnelseKoder: props.begrunnelseKoder,
      },
    },
  });

  it("Bruker begrunnelseFritekst dersom den er oppgitt", () => {
    props.begrunnelseFritekst = "begrunnelse-fritekst for hennleggelse";

    renderWithProviders(<Henlagtsak />, { preloadedState: initialState() });

    expect(screen.getByText(props.begrunnelseFritekst)).toBeInTheDocument();
  });

  it("Bruker begrunnelseKode dersom fritekst ikke er oppgitt", () => {
    renderWithProviders(<Henlagtsak />, { preloadedState: initialState() });

    expect(screen.getByText("Søknaden er trukket")).toBeInTheDocument();
  });

  it("Bruker default setning dersom verken kode eller fritekst er oppgitt", () => {
    props.begrunnelseKoder = [];
    renderWithProviders(<Henlagtsak />, { preloadedState: initialState() });

    expect(screen.getByText("Ukjent grunn")).toBeInTheDocument();
  });
});
