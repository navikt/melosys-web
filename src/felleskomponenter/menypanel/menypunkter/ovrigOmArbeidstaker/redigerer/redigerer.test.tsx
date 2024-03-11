import { screen } from "@testing-library/react";
import Redigerer from "./redigerer";
import Sporsmal from "../sporsmal";
import * as KV from "../../../../../kodeverk";
import { renderWithProviders } from "../../../../../ducks/test-utils/renderWithProviders";
import { reduxForm } from "redux-form";

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
  const WrappedRedigerer = reduxForm({ form: KV.Form.SOKNAD })(Redigerer);

  it("beskrivelseArbeidSisteMnd vises hvis harLoennetArbeidMinstEnMndFoerUtsending er false", () => {
    renderWithProviders(<WrappedRedigerer />, { preloadedState: reduxStore(false) });
    expect(screen.getByText(Sporsmal.beskrivelseArbeidSisteMnd)).toBeInTheDocument();
  });

  it("beskrivelseArbeidSisteMnd vises ikke hvis harLoennetArbeidMinstEnMndFoerUtsending er true", () => {
    renderWithProviders(<WrappedRedigerer />, { preloadedState: reduxStore(true) });
    expect(screen.queryByText(Sporsmal.beskrivelseArbeidSisteMnd)).toBeNull();
  });

  it("beskrivelseAnnetArbeid vises hvis harAndreArbeidsgivereIUtsendingsperioden er true", () => {
    renderWithProviders(<WrappedRedigerer />, { preloadedState: reduxStore(true, true) });
    expect(screen.getByText(Sporsmal.beskrivelseAnnetArbeid)).toBeInTheDocument();
  });

  it("beskrivelseAnnetArbeid vises ikke hvis harAndreArbeidsgivereIUtsendingsperioden er false", () => {
    renderWithProviders(<WrappedRedigerer />, { preloadedState: reduxStore(true, false) });
    expect(screen.queryByText(Sporsmal.beskrivelseAnnetArbeid)).toBeNull();
  });
});
