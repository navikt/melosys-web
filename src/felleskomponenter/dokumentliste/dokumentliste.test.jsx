import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as EKV from "eessi-kodeverk";
import MKV from "../../melosyskodeverk";

import Dokumentliste from "./dokumentliste";
import * as KV from "../../kodeverk";

vi.mock("../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));

describe("Dokumentliste", () => {
  let props = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));
    props = {
      behandlingID: 1,
      dokumenter: [
        {
          dokumentData: {
            produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_MANGLENDE_OPPLYSNINGER,
            mottaker: MKV.Koder.mottakerroller.BRUKER,
            begrunnelseKode: MKV.Koder.begrunnelser.folketrygdloven.avslag.MANGLENDE_OPPLYSNINGER,
          },
        },
        {
          sedType: EKV.Koder.sedtyper.A003,
        },
      ],
      validateOnClick: vi.fn(() => true),
    };
  });

  it("viser samme antall linker som antall dokumenter passet som props ", () => {
    props.dokumenter = [];
    render(<Dokumentliste {...props} />);

    expect(screen.queryAllByRole("link")).toHaveLength(props.dokumenter.length);

    props.dokumenter = [
      { dokumentData: { produserbardokument: "", mottaker: "" } },
      { dokumentData: { produserbardokument: "", mottaker: "" } },
      { dokumentData: { produserbardokument: "", mottaker: "" } },
    ];
    render(<Dokumentliste {...props} />);

    expect(screen.queryAllByRole("link")).toHaveLength(props.dokumenter.length);
  });

  describe("forhåndsvisning av brev", () => {
    it("viser feilmelding ved 400-feil fra backend", async () => {
      const responseBody = {
        error: null,
        status: 400,
        message: "feilmelding",
      };
      fetch.mockResponse(JSON.stringify(responseBody), { status: responseBody.status });

      render(<Dokumentliste {...props} />);
      const user = userEvent.setup();

      await act(async () => {
        user.click(
          screen.getByText(
            `${KV.kodeTilTerm(
              props.dokumenter[0].dokumentData?.produserbardokument,
              MKV.KTObjects.brev.produserbaredokumenter
            )} (åpnes i ny fane)`
          )
        );
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

      render(<Dokumentliste {...props} />);
      const user = userEvent.setup();

      await act(async () => {
        user.click(
          screen.getByText(
            `${KV.kodeTilTerm(
              props.dokumenter[0].dokumentData?.produserbardokument,
              MKV.KTObjects.brev.produserbaredokumenter
            )} (åpnes i ny fane)`
          )
        );
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

      render(<Dokumentliste {...props} />);
      const user = userEvent.setup();

      await act(async () => {
        user.click(screen.getByText(`SED ${props.dokumenter[1].sedType} (åpnes i ny fane)`));
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

      render(<Dokumentliste {...props} />);
      const user = userEvent.setup();

      await act(async () => {
        user.click(screen.getByText(`SED ${props.dokumenter[1].sedType} (åpnes i ny fane)`));
      });

      expect(await screen.findByText("Det oppstod en feil da SED skulle forhåndsvises!")).toBeInTheDocument();
    });
  });
});
