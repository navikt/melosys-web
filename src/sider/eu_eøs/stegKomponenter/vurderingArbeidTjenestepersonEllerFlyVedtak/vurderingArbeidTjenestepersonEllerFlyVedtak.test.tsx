import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import VurderingArbeidTjenestepersonEllerFlyVedtak from "./vurderingArbeidTjenestepersonEllerFlyVedtak";

describe("VurderingArbeidTjenestepersonEllerFlyVedtak", () => {
  const defaultOwnProps = {
    redigerbart: true,
    lovvalgsbestemmelseSomSkalVises: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
    lagreLovvalgsperioder: vi.fn(),
    oppdaterData: vi.fn(),
    slettData: vi.fn(),
    tilbake: vi.fn(),
    validerMottatteOpplysninger: vi.fn(() => Promise.resolve()),
    kontrollerFerdigbehandling: vi.fn(() => Promise.resolve()),
    informertMyndighetFakta: {},
  };

  const initialStore = {
    form: {
      [KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK]: {
        values: {
          lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
        },
      },
    },
    behandlinger: {
      data: {
        behandlingID: 123,
        behandlingstype: MKV.Koder.behandlinger.behandlingstyper.NY,
        behandlingstema: MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
      },
    },
    behandlingsresultat: {
      data: {
        begrunnelseKoder: [],
        begrunnelseFritekst: "",
        vedtakstype: null,
      },
    },
    lovvalgsperioder: {
      fomDato: "2024-01-01",
      tomDato: "2024-12-31",
    },
    mottatteOpplysninger: {
      data: {
        periode: {
          fom: "2024-01-01",
          tom: "2024-12-31",
        },
        selvstendigArbeid: {
          erSelvstendig: false,
        },
      },
      status: "OK",
    },
    avklartefakta: {
      data: [],
    },
    fagsaker: {
      data: {
        sakstype: MKV.Koder.sakstyper.EU_EOS,
      },
    },
    redigerbart: {
      harFeilmeldinger: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("grunnleggende rendering", () => {
    it("skal rendre komponenten uten feil", () => {
      renderWithProviders(<VurderingArbeidTjenestepersonEllerFlyVedtak {...defaultOwnProps} />, {
        preloadedState: initialStore,
      });

      expect(screen.getByText(/Omfattet av norsk lovgivning etter/)).toBeInTheDocument();
    });

    it("skal vise fritekst textarea for begrunnelse", () => {
      renderWithProviders(<VurderingArbeidTjenestepersonEllerFlyVedtak {...defaultOwnProps} />, {
        preloadedState: initialStore,
      });

      expect(screen.getByText("Fritekst til begrunnelse")).toBeInTheDocument();
    });

    it("skal vise 'Fatt vedtak' knapp", () => {
      renderWithProviders(<VurderingArbeidTjenestepersonEllerFlyVedtak {...defaultOwnProps} />, {
        preloadedState: initialStore,
      });

      expect(screen.getByText("Fatt vedtak")).toBeInTheDocument();
    });
  });

  describe("conditional rendering basert på lovvalgsbestemmelse", () => {
    it("skal vise radio for informering av utenlandsk trygdemyndighet når Art 11.5 er valgt", () => {
      const storeWithArt11_5 = {
        ...initialStore,
        form: {
          [KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK]: {
            values: {
              lovvalgsbestemmelse: MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
            },
          },
        },
      };

      const propsWithArt11_5 = {
        ...defaultOwnProps,
        lovvalgsbestemmelseSomSkalVises:
          MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
      };

      renderWithProviders(<VurderingArbeidTjenestepersonEllerFlyVedtak {...propsWithArt11_5} />, {
        preloadedState: storeWithArt11_5,
      });

      expect(screen.getByText("Skal utenlandsk trygdemyndighet informeres?")).toBeInTheDocument();
    });

    it("skal ikke vise radio for informering av utenlandsk trygdemyndighet når Art 11.3B er valgt", () => {
      renderWithProviders(<VurderingArbeidTjenestepersonEllerFlyVedtak {...defaultOwnProps} />, {
        preloadedState: initialStore,
      });

      expect(screen.queryByText("Skal utenlandsk trygdemyndighet informeres?")).not.toBeInTheDocument();
    });
  });

  describe("behandlingstema ARBEID_TJENESTEPERSON_ELLER_FLY", () => {
    it("skal rendre komponenten for behandlingstema ARBEID_TJENESTEPERSON_ELLER_FLY", () => {
      renderWithProviders(<VurderingArbeidTjenestepersonEllerFlyVedtak {...defaultOwnProps} />, {
        preloadedState: initialStore,
      });

      // Komponenten skal rendre uten feil for dette behandlingstemaet
      expect(screen.getByText(/Omfattet av norsk lovgivning etter/)).toBeInTheDocument();
      expect(screen.getByText("Fatt vedtak")).toBeInTheDocument();
    });
  });
});
