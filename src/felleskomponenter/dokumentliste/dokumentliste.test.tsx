import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// @ts-expect-error - Missing type definitions
import * as EKV from "eessi-kodeverk";
import MKV from "../../melosyskodeverk";

import Dokumentliste from "./dokumentliste";
import * as KV from "../../kodeverk";

vi.mock("../../featuretoggle", () => ({
  useFeatureToggle: vi.fn(),
}));

vi.mock("../../ducks/dokumenter", () => ({
  dokumenterOperations: {
    forhandsvisBrevV2: vi.fn(),
    forhandsvisSed: vi.fn(),
  },
}));

import { dokumenterOperations } from "../../ducks/dokumenter";

describe("Dokumentliste", () => {
  let props: any;

  beforeEach(() => {
    vi.clearAllMocks();
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
      const errorMessage = "feilmelding";
      (dokumenterOperations.forhandsvisBrevV2 as any).mockRejectedValue({
        status: 400,
        body: { message: errorMessage },
      });

      render(<Dokumentliste {...props} />);
      const user = userEvent.setup();

      await user.click(
        screen.getByText(
          `${KV.kodeTilTerm(
            props.dokumenter[0].dokumentData?.produserbardokument,
            MKV.KTObjects.brev.produserbaredokumenter,
          )}`,
        ),
      );

      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    it("viser feilmelding ved 500-feil fra backend", async () => {
      (dokumenterOperations.forhandsvisBrevV2 as any).mockRejectedValue({
        status: 500,
      });

      render(<Dokumentliste {...props} />);
      const user = userEvent.setup();

      await user.click(
        screen.getByText(
          `${KV.kodeTilTerm(
            props.dokumenter[0].dokumentData?.produserbardokument,
            MKV.KTObjects.brev.produserbaredokumenter,
          )}`,
        ),
      );

      expect(await screen.findByText("Det oppstod en feil da brevet skulle forhåndsvises!")).toBeInTheDocument();
    });
  });

  describe("forhåndsvisning av sed", () => {
    it("viser feilmelding ved 400-feil fra backend", async () => {
      const errorMessage = "feilmelding";
      (dokumenterOperations.forhandsvisSed as any).mockRejectedValue({
        status: 400,
        body: { message: errorMessage },
      });

      render(<Dokumentliste {...props} />);
      const user = userEvent.setup();

      await user.click(screen.getByText(`SED ${props.dokumenter[1].sedType}`));

      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    it("viser feilmelding ved 500-feil fra backend", async () => {
      (dokumenterOperations.forhandsvisSed as any).mockRejectedValue({
        status: 500,
      });

      render(<Dokumentliste {...props} />);
      const user = userEvent.setup();

      await user.click(screen.getByText(`SED ${props.dokumenter[1].sedType}`));

      expect(await screen.findByText("Det oppstod en feil da SED skulle forhåndsvises!")).toBeInTheDocument();
    });
  });
});
