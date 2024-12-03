import { screen } from "@testing-library/react";
import { expect } from "vitest";

import RedigeringUtfort from "./redigeringUtfort";
import Sporsmal from "../sporsmal";
import * as KV from "../../../../../kodeverk";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";

describe("RedigeringUtført", () => {
  const reduxStore = (
    harLoennetArbeidMinstEnMndFoerUtsending = true,
    harAndreArbeidsgivereIUtsendingsperioden = true,
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
    renderWithProviders(<RedigeringUtfort />, { preloadedState: reduxStore(false) });
    expect(screen.getByText(Sporsmal.beskrivelseArbeidSisteMnd)).toBeInTheDocument();
  });

  it("beskrivelseArbeidSisteMnd vises ikke hvis harLoennetArbeidMinstEnMndFoerUtsending er true", () => {
    renderWithProviders(<RedigeringUtfort />, { preloadedState: reduxStore(true) });
    expect(screen.queryByText(Sporsmal.beskrivelseArbeidSisteMnd)).toBeNull();
  });

  it("beskrivelseAnnetArbeid vises hvis harAndreArbeidsgivereIUtsendingsperioden er true", () => {
    renderWithProviders(<RedigeringUtfort />, { preloadedState: reduxStore(true, true) });
    expect(screen.getByText(Sporsmal.beskrivelseAnnetArbeid)).toBeInTheDocument();
  });

  it("beskrivelseAnnetArbeid vises ikke hvis harAndreArbeidsgivereIUtsendingsperioden er false", () => {
    renderWithProviders(<RedigeringUtfort />, { preloadedState: reduxStore(true, false) });
    expect(screen.queryByText(Sporsmal.beskrivelseAnnetArbeid)).toBeNull();
  });
});
