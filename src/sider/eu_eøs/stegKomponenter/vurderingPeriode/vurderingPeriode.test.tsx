import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MKV from "../../../../melosyskodeverk";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import { STATUS } from "../../../../services";

import { VurderingPeriode } from "./vurderingPeriode";

describe("VurderingPeriode", () => {
  let props: any;
  let initialReduxState: any;

  beforeEach(() => {
    vi.clearAllMocks();

    props = {
      redigerbart: true,
      byggLovvalgsperioder: vi.fn(),
      lovvalgsbestemmelseSomSkalLagres: "",
      lovvalgsbestemmelseSomSkalVises: "",
      oppdaterData: vi.fn(),
      slettData: vi.fn(),
      tilbake: vi.fn(),
      bekreftOgFortsett: vi.fn(),
      aktivtSteg: true,
    };

    initialReduxState = {
      mottatteOpplysninger: {
        data: {
          periode: {
            fom: "2024-01-01",
            tom: "2024-12-31",
          },
        },
        status: STATUS.OK,
      },
      lovvalgsperioder: {
        data: [
          {
            fomDato: "2024-01-01",
            tomDato: "2024-12-31",
          },
        ],
        status: STATUS.OK,
      },
    };
  });

  /**
   * MERK: Disse testene er skrevet for å teste komponenten med eksisterende type-problemer.
   * Dette er en del av TODO-26 Fase 1 Steg 3. Type-fikser kommer senere i Fase 3.
   *
   * Formål: Etablere baseline behavior før type-fikser og useEffect-refaktorering.
   */

  describe("Rendering med ulike props", () => {
    it("viser ikke komponenten når aktivtSteg er false", () => {
      props.aktivtSteg = false;
      const { container } = renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      expect(container.firstChild).toBeNull();
    });

    it("viser hovedoverskrift når aktivtSteg er true", () => {
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      expect(screen.getByRole("heading", { name: "Lovvalgsbestemmelse og -periode", level: 1 })).toBeInTheDocument();
    });

    it("viser radiogruppe for lovvalgsbestemmelser", () => {
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      expect(screen.getByText("Velg en lovvalgsbestemmelse")).toBeInTheDocument();
    });

    it("viser kun lovvalgsbestemmelser ART11_3B og ART11_5", () => {
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      // Finn ART11_3B term
      const art11_3b = MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.find(
        (b: any) => b.kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      );
      expect(screen.getByText(art11_3b.term)).toBeInTheDocument();

      // Finn ART11_5 term
      const art11_5 = MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.find(
        (b: any) => b.kode === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
      );
      expect(screen.getByText(art11_5.term)).toBeInTheDocument();
    });

    it("viser lovvalgsperiode når redigerbart er true", () => {
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      expect(screen.getByText("Lovvalgsperiode")).toBeInTheDocument();
      expect(screen.getByText(/01.01.2024 - 31.12.2024/)).toBeInTheDocument();
    });

    it("viser ikke lovvalgsperiode-seksjon når redigerbart er false", () => {
      props.redigerbart = false;
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      expect(screen.queryByText("Lovvalgsperiode")).not.toBeInTheDocument();
    });

    it("viser checkbox for periode-forkortning", () => {
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      expect(screen.getByRole("checkbox", { name: "Lovvalget innvilges for en kortere periode" })).toBeInTheDocument();
    });

    it("viser StegKnapper", () => {
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      expect(screen.getByRole("button", { name: "Bekreft og fortsett" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Tilbake" })).toBeInTheDocument();
    });

    it("disabler Bekreft-knapp når ingen lovvalgsbestemmelse er valgt", () => {
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      const bekreftKnapp = screen.getByRole("button", { name: "Bekreft og fortsett" });
      expect(bekreftKnapp).toBeDisabled();
    });

    it("disabler Tilbake-knapp når redigerbart er false", () => {
      props.redigerbart = false;
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      const tilbakeKnapp = screen.getByRole("button", { name: "Tilbake" });
      expect(tilbakeKnapp).toBeDisabled();
    });

    it("pre-fyller lovvalgsbestemmelse når lovvalgsbestemmelseSomSkalVises er satt", () => {
      props.lovvalgsbestemmelseSomSkalVises =
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B;

      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      const art11_3b = MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.find(
        (b: any) => b.kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      );

      const radioButton = screen.getByRole("radio", { name: art11_3b.term });
      expect(radioButton).toBeChecked();
    });

    it("viser readonly form-elementer når redigerbart er false", () => {
      props.redigerbart = false;
      props.lovvalgsbestemmelseSomSkalVises =
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B;

      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      const art11_3b = MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.find(
        (b: any) => b.kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
      );

      // Verifiser at radio button eksisterer og er checked
      const radioButton = screen.getByRole("radio", { name: art11_3b.term });
      expect(radioButton).toBeChecked();
    });
  });

  describe("Form submission og validering", () => {
    it("kaller tilbake når tilbake-knapp klikkes", async () => {
      const user = userEvent.setup();
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      const tilbakeKnapp = screen.getByRole("button", { name: "Tilbake" });
      await user.click(tilbakeKnapp);

      expect(props.tilbake).toHaveBeenCalledTimes(1);
    });

    it("viser disabled submit-knapp når ingen lovvalgsbestemmelse er valgt", async () => {
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      // Verifiser at knapp er disabled når form ikke er valid
      const bekreftKnapp = screen.getByRole("button", { name: "Bekreft og fortsett" });
      expect(bekreftKnapp).toBeDisabled();
    });
  });

  describe("Periode-forkortning interaksjoner", () => {
    it("viser checkbox for periode-forkortning", () => {
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      const checkbox = screen.getByRole("checkbox", { name: "Lovvalget innvilges for en kortere periode" });
      expect(checkbox).toBeInTheDocument();
    });

    it("setter checkbox til checked når forkortet periode finnes", () => {
      // Mock state med forkortet periode
      initialReduxState.lovvalgsperioder.data = [
        {
          fomDato: "2024-03-01",
          tomDato: "2024-09-30",
        },
      ];

      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      const checkbox = screen.getByRole("checkbox", { name: "Lovvalget innvilges for en kortere periode" });
      expect(checkbox).toBeChecked();
    });

    it("viser ikke checkbox når redigerbart er false", () => {
      props.redigerbart = false;

      // Mock state med forkortet periode
      initialReduxState.lovvalgsperioder.data = [
        {
          fomDato: "2024-03-01",
          tomDato: "2024-09-30",
        },
      ];

      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      // Checkbox vises ikke når ikke redigerbart
      const checkbox = screen.queryByRole("checkbox", { name: "Lovvalget innvilges for en kortere periode" });
      expect(checkbox).not.toBeInTheDocument();
    });
  });

  describe("useEffect behaviors", () => {
    it("kaller oppdaterData ved mount", () => {
      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      // oppdaterData kalles ved mount (useEffect)
      expect(props.oppdaterData).toHaveBeenCalled();
    });

    it("kaller slettData ved unmount", () => {
      const { unmount } = renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      unmount();

      expect(props.slettData).toHaveBeenCalledTimes(1);
    });

    it("resetter ikke data hvis redigerbart er false", () => {
      props.redigerbart = false;

      renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      // oppdaterData skal ikke kalles for periode-oppdatering når ikke redigerbart
      // (kun initial mount call hvis lovvalgsbestemmelseSomSkalLagres er satt)
      expect(props.oppdaterData).toHaveBeenCalledTimes(0);
    });
  });

  describe("Edge cases og error handling", () => {
    it("håndterer manglende mottatteOpplysninger i Redux state", () => {
      initialReduxState.mottatteOpplysninger.data = null;

      const { container } = renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      // Komponenten skal fortsatt rendre uten å krasje
      expect(container.querySelector("form")).toBeInTheDocument();
    });

    it("håndterer manglende lovvalgsperioder i Redux state", () => {
      initialReduxState.lovvalgsperioder.data = [];

      const { container } = renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      // Komponenten skal fortsatt rendre
      expect(container.querySelector("form")).toBeInTheDocument();
    });

    it("håndterer undefined periode i mottatteOpplysninger", () => {
      initialReduxState.mottatteOpplysninger.data = {};

      const { container } = renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });

      expect(container.querySelector("form")).toBeInTheDocument();
    });
  });

  describe("Snapshot testing", () => {
    beforeAll(() => {
      vi.setSystemTime(new Date("2024-06-15T12:00:00.000Z"));
    });

    afterAll(() => {
      // Restore real time after snapshot tests
      vi.useRealTimers();
    });

    it("snapshot test - default state", () => {
      const { container } = renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      expect(container).toMatchSnapshot();
    });

    it("snapshot test - med valgt lovvalgsbestemmelse", () => {
      props.lovvalgsbestemmelseSomSkalVises =
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B;

      const { container } = renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      expect(container).toMatchSnapshot();
    });

    it("snapshot test - readonly mode", () => {
      props.redigerbart = false;
      props.lovvalgsbestemmelseSomSkalVises =
        MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B;

      const { container } = renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      expect(container).toMatchSnapshot();
    });

    it("snapshot test - med forkortet periode", () => {
      initialReduxState.lovvalgsperioder.data = [
        {
          fomDato: "2024-03-01",
          tomDato: "2024-09-30",
        },
      ];

      const { container } = renderWithProviders(<VurderingPeriode {...props} />, {
        preloadedState: initialReduxState,
      });
      expect(container).toMatchSnapshot();
    });
  });
});
