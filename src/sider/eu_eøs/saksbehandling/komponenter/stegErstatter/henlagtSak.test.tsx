import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";
import MKV from "../../../../../melosyskodeverk";
import HenlagtSak from "./henlagtSak";

describe("HenlagtSak", () => {
  let props: any;

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

    renderWithProviders(<HenlagtSak />, { preloadedState: initialState() });

    expect(screen.getByText(props.begrunnelseFritekst)).toBeInTheDocument();
  });

  it.each([
    '<div class="ql-fritekst"><p><strong>Oppholdet</strong> er avlyst.</p><p>Årsak &amp; detaljer<br>&lt;tekst&gt;</p></div>',
    "<p><strong>Oppholdet</strong> er avlyst.</p><p>Årsak &amp; detaljer<br>&lt;tekst&gt;</p>",
  ])("Viser HTML-fritekst som ren tekst med linjeskift: %s", (html) => {
    props.begrunnelseFritekst = html;

    renderWithProviders(<HenlagtSak />, { preloadedState: initialState() });

    const beskrivelse = screen.getByText(/Oppholdet er avlyst/);
    expect(beskrivelse.textContent).toBe("Oppholdet er avlyst.\n\nÅrsak & detaljer\n<tekst>");
    expect(beskrivelse.children).toHaveLength(0);
  });

  it("Bruker begrunnelseKode dersom fritekst ikke er oppgitt", () => {
    renderWithProviders(<HenlagtSak />, { preloadedState: initialState() });

    expect(screen.getByText("Søknaden er trukket")).toBeInTheDocument();
  });

  it("Bruker default setning dersom verken kode eller fritekst er oppgitt", () => {
    props.begrunnelseKoder = [];
    renderWithProviders(<HenlagtSak />, { preloadedState: initialState() });

    expect(screen.getByText("Ukjent grunn")).toBeInTheDocument();
  });
});
