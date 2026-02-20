import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { reduxForm } from "redux-form";

import MKV from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import { VurderingArtikkel16Anmodning } from "./vurderingArtikkel16Anmodning";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

const mockUseFeatureToggle = vi.fn();
vi.mock("../../../../featuretoggle", () => ({
  useFeatureToggle: (...args: unknown[]) => mockUseFeatureToggle(...args),
}));

vi.mock("../../../../ducks/avklartefakta", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    avklartefaktaSelectors: {
      ...actual.avklartefaktaSelectors,
      ArbeidslandKTSelector: () => [{ kode: "SE", term: "Sverige" }],
    },
  };
});

vi.mock("../../../../ducks/dokumenter", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    dokumenterSelectors: {
      ...actual.dokumenterSelectors,
      AlleFysiskeDokumentSelector: () => [],
    },
  };
});

vi.mock("../../../../ducks/mottatteOpplysninger", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    mottatteOpplysningerSelectors: {
      ...actual.mottatteOpplysningerSelectors,
      MottatteOpplysningerStatusSelector: () => "OK",
    },
  };
});

vi.mock("../../../../ducks/kontroll", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    kontrollSelectors: {
      ...actual.kontrollSelectors,
      KontrollFeilSelector: () => [],
    },
    kontrollOperations: {
      ...actual.kontrollOperations,
      kontrollerAnmodningOmUnntak: vi.fn(() => () => Promise.resolve()),
      resetKontrollFeil: vi.fn(() => ({ type: "KONTROLL_RESET" })),
    },
  };
});

describe("VurderingArtikkel16Anmodning - TWFA checkbox", () => {
  let props: any;

  const WrappedComponent = reduxForm({ form: KV.Form.ARTIKKEL_16_ANMODNING })(VurderingArtikkel16Anmodning as any);

  beforeEach(() => {
    vi.clearAllMocks();
    props = {
      lovvalgsbestemmelse: undefined,
      formIsValid: true,
      formValues: {
        tidligeremedlemskap: [],
        mottakerinstitusjon: "",
        kreverMottakerinstitusjon: false,
        fritekstSed: null,
      },
      initialValues: {
        tidligeremedlemskap: [],
        mottakerinstitusjon: "",
        kreverMottakerinstitusjon: false,
        fritekstSed: null,
      },
      tilstand: {
        unntaksvilkår: {
          begrunnelseKoder: [],
          begrunnelseFritekst: "",
          begrunnelseFritekstEngelsk: "",
        },
        muligeBegrunnelseValg: [],
        erIDirekteTilArtikkel16Flyt: false,
        harAvklaring: false,
      },
      bekreftOgFortsett: vi.fn(),
      tilbake: vi.fn(),
      oppdaterData: vi.fn(),
      slettData: vi.fn(),
      redigerbart: true,
      aktivtSteg: true,
      lagreVilkarHandler: vi.fn(),
      lagreAnmodningsperioderHandler: vi.fn().mockResolvedValue(undefined),
      byggAnmodningsperioderHandler: vi.fn().mockResolvedValue(undefined),
      lagreOgBestillAnmodningsperioder: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("viser ikke TWFA-checkbox når CDM 4.4 er deaktivert", () => {
    mockUseFeatureToggle.mockReturnValue(false);
    renderWithProviders(<WrappedComponent {...props} />);
    expect(screen.queryByText(/Rammeavtale om fjernarbeid/)).not.toBeInTheDocument();
  });

  it("viser ikke TWFA-checkbox når CDM 4.4 er aktivert men annen artikkel er valgt", () => {
    mockUseFeatureToggle.mockReturnValue(true);
    renderWithProviders(<WrappedComponent {...props} />);
    expect(screen.queryByText(/Rammeavtale om fjernarbeid/)).not.toBeInTheDocument();
  });

  it("viser ikke TWFA-checkbox når redigerbart er false", () => {
    mockUseFeatureToggle.mockReturnValue(true);
    renderWithProviders(<WrappedComponent {...props} redigerbart={false} />);
    expect(screen.queryByText(/Rammeavtale om fjernarbeid/)).not.toBeInTheDocument();
  });

  it("viser TWFA-checkbox når CDM 4.4 er aktivert og artikkel 13(1)(a) er valgt", () => {
    mockUseFeatureToggle.mockReturnValue(true);
    renderWithProviders(<WrappedComponent {...props} />, {
      preloadedState: {
        anmodningsperioder: {
          status: "OK",
          data: [
            {
              unntakFraBestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A,
              fomDato: "2024-01-01",
              tomDato: "2024-12-31",
            },
          ],
        },
      } as any,
    });
    expect(screen.getByText(/Rammeavtale om fjernarbeid/)).toBeInTheDocument();
  });

  it("kan krysse av og fjerne TWFA-avkrysning", () => {
    mockUseFeatureToggle.mockReturnValue(true);
    renderWithProviders(<WrappedComponent {...props} />, {
      preloadedState: {
        anmodningsperioder: {
          status: "OK",
          data: [
            {
              unntakFraBestemmelse: MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A,
              fomDato: "2024-01-01",
              tomDato: "2024-12-31",
            },
          ],
        },
      } as any,
    });

    const checkbox = screen.getByRole("checkbox", { name: /Rammeavtale om fjernarbeid/i });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
