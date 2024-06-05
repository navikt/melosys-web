import { ComponentProps } from "react";
import { instance, mock } from "ts-mockito";

import { screen } from "@testing-library/react";

import MKV from "../../../../melosyskodeverk";

import { VurderingInngang } from "./vurderingInngang";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";

describe("VurderingInngang", () => {
  const initialStore = (behandlingstema: string, landkoder: string[], flereLandUkjentHvilke: boolean) => ({
    behandlinger: {
      status: "",
      data: {
        oppsummering: {
          behandlingstema: {
            kode: behandlingstema,
          },
        },
      },
    },
    mottatteOpplysninger: {
      status: "",
      data: {
        data: {
          soeknadsland: {
            landkoder,
            flereLandUkjentHvilke,
          },
        },
      },
    },
  });

  const mockedProps = mock<ComponentProps<typeof VurderingInngang>>();
  let props = instance(mockedProps);

  beforeEach(() => {
    props = {
      bekreftOgFortsett: vi.fn(),
      redigerbart: true,
      inngangsvilkaar: {
        vilkaar: MKV.Koder.vilkaar.FO_883_2004_INNGANGSVILKAAR,
        oppfylt: true,
        begrunnelseKoder: [],
        begrunnelseFritekst: "Begrunnelse",
        begrunnelseFritekstEngelsk: null,
      },
      oppfyllerInngangsvilkar: true,
    };
  });

  describe("knapp for å gå videre i stegvelger", () => {
    it("er ikke disabled dersom redigerbart er true", () => {
      renderWithProviders(<VurderingInngang {...props} />);

      expect(screen.getByRole("button", { name: "Bekreft og fortsett" })).not.toBeDisabled();
    });

    it("er disabled dersom redigerbart er false", () => {
      props.redigerbart = false;

      renderWithProviders(<VurderingInngang {...props} />);

      expect(screen.getByRole("button", { name: "Bekreft og fortsett" })).toBeDisabled();
    });
  });

  it("Viser feilmelding ved flere valgte land og ikke tema ARBEID_FLERE_LAND", async () => {
    renderWithProviders(<VurderingInngang {...props} />, {
      preloadedState: initialStore(MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER, ["DK", "SE"], false),
    });

    expect(
      await screen.findByText(
        "Du har valgt et behandlingstema som kun tillater ett arbeidsland. Du må fjerne land under “Periode og land” i sidemenyen eller endre behandlingstema."
      )
    ).toBeInTheDocument();
  });

  it("Viser feilmelding ved flereLandUkjentHvilke og ikke tema ARBEID_FLERE_LAND", async () => {
    renderWithProviders(<VurderingInngang {...props} />, {
      preloadedState: initialStore(MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER, [], true),
    });

    expect(
      await screen.findByText(
        "Du har valgt et behandlingstema som kun tillater ett arbeidsland. Du må fjerne land under “Periode og land” i sidemenyen eller endre behandlingstema."
      )
    ).toBeInTheDocument();
  });

  it("Viser feilmelding ved ett valgt land og tema ARBEID_FLERE_LAND", async () => {
    renderWithProviders(<VurderingInngang {...props} />, {
      preloadedState: initialStore(MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND, ["DK"], false),
    });

    expect(
      await screen.findByText(
        "Det er påkrevd med to eller flere land for valgt behandlingstema. Du må legge til land under “Periode og land” i sidemenyen eller endre behandlingstema."
      )
    ).toBeInTheDocument();
  });
});
