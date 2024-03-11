import { screen } from "@testing-library/react";
import Redigerer from "./redigerer";
import Sporsmal from "../sporsmal";
import * as KV from "../../../../../kodeverk";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";

describe("Redigerer", () => {
  const reduxStore = (
    harLoennetArbeidMinstEnMndFoerUtsending = true,
    harAndreArbeidsgivereIUtsendingsperioden = true
  ) => ({
    form: {
      [KV.Form.SOKNAD]: {
        registeredFields: [],
        values: {
          arbeidssituasjonOgOevrig: {
            harLoennetArbeidMinstEnMndFoerUtsending,
            harAndreArbeidsgivereIUtsendingsperioden,
          },
        },
      },
    },
  });

  it("beskrivelseArbeidSisteMnd vises hvis harLoennetArbeidMinstEnMndFoerUtsending er false", () => {
    renderWithProviders(<Redigerer />, { preloadedState: reduxStore(false) });
    expect(screen.getByText(Sporsmal.beskrivelseArbeidSisteMnd)).toBeInTheDocument();
  });

  it("beskrivelseArbeidSisteMnd vises ikke hvis harLoennetArbeidMinstEnMndFoerUtsending er true", () => {
    renderWithProviders(<Redigerer />, { preloadedState: reduxStore(true) });
    expect(screen.queryByText(Sporsmal.beskrivelseArbeidSisteMnd)).toBeNull();
  });

  it("beskrivelseAnnetArbeid vises hvis harAndreArbeidsgivereIUtsendingsperioden er true", () => {
    renderWithProviders(<Redigerer />, { preloadedState: reduxStore(true, true) });
    expect(screen.getByText(Sporsmal.beskrivelseAnnetArbeid)).toBeInTheDocument();
  });

  it("beskrivelseAnnetArbeid vises ikke hvis harAndreArbeidsgivereIUtsendingsperioden er false", () => {
    renderWithProviders(<Redigerer />, { preloadedState: reduxStore(true, false) });
    expect(screen.queryByText(Sporsmal.beskrivelseAnnetArbeid)).toBeNull();
  });
});
