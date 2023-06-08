import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MKV from "../../melosyskodeverk";
import * as EKV from "eessi-kodeverk";

import PdfLenkeListe from "./pdfLenkeListe";

jest.mock("../../featuretoggle", () => ({
  useFeatureToggle: jest.fn(),
}));

describe("PdfLenkeListe", () => {
  let props = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));
    props = {
      behandlingID: 1,
      dokumenter: [
        {
          navn: "Forhåndsvis vedtaksbrev",
          data: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_MANGLENDE_OPPLYSNINGER,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
            begrunnelseKode: MKV.Koder.begrunnelser.folketrygdloven.avslag.MANGLENDE_OPPLYSNINGER,
          },
        },
        {
          navn: "Forhåndsvis SED A003",
          type: EKV.Koder.sedtyper.A003,
          erSed: true,
          data: {},
        },
      ],
      vedKlikk: jest.fn(() => true),
    };
  });

  it("viser samme antall linker som antall dokumenter passet som props ", () => {
    props.dokumenter = [];
    render(<PdfLenkeListe {...props} />);

    expect(screen.queryAllByRole("button")).toHaveLength(props.dokumenter.length);

    props.dokumenter = [
      { navn: "test", data: {} },
      { navn: "test", data: {} },
      { navn: "test", data: {} },
    ];
    render(<PdfLenkeListe {...props} />);

    expect(screen.queryAllByRole("button")).toHaveLength(props.dokumenter.length);
  });

  describe("forhåndsvisning av brev", () => {
    it("viser feilmelding ved 400-feil fra backend", async () => {
      const responseBody = {
        error: null,
        status: 400,
        message: "feilmelding",
      };
      fetch.mockResponse(JSON.stringify(responseBody), { status: responseBody.status });

      render(<PdfLenkeListe {...props} />);
      const user = userEvent.setup();

      await act(async () => {
        user.click(screen.getByText(props.dokumenter[0].navn));
      });

      expect(await screen.findByText(responseBody.message)).toBeInTheDocument();
    });

    it("viser feilmelding ved 500-feil fra backend", async () => {
      const responseBody = {
        error: null,
        status: 500,
        message: "feilmelding",
      };
      fetch.mockResponse(JSON.stringify(responseBody), { status: responseBody.status });

      render(<PdfLenkeListe {...props} />);
      const user = userEvent.setup();

      await act(async () => {
        user.click(screen.getByText(props.dokumenter[0].navn));
      });

      expect(await screen.findByText("Det oppstod en feil da brevet skulle forhåndsvises!")).toBeInTheDocument();
    });
  });

  describe("forhåndsvisning av sed", () => {
    it("viser feilmelding ved 400-feil fra backend", async () => {
      const responseBody = {
        error: null,
        status: 400,
        message: "feilmelding",
      };
      fetch.mockResponse(JSON.stringify(responseBody), { status: responseBody.status });

      render(<PdfLenkeListe {...props} />);
      const user = userEvent.setup();

      await act(async () => {
        user.click(screen.getByText(props.dokumenter[1].navn));
      });

      expect(await screen.findByText(responseBody.message)).toBeInTheDocument();
    });

    it("viser feilmelding ved 500-feil fra backend", async () => {
      const responseBody = {
        error: null,
        status: 500,
        message: "feilmelding",
      };
      fetch.mockResponse(JSON.stringify(responseBody), { status: responseBody.status });

      render(<PdfLenkeListe {...props} />);
      const user = userEvent.setup();

      await act(async () => {
        user.click(screen.getByText(props.dokumenter[1].navn));
      });

      expect(await screen.findByText("Det oppstod en feil da SED skulle forhåndsvises!")).toBeInTheDocument();
    });
  });
});
