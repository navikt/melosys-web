import { screen } from "@testing-library/react";
import Arbeidssteder from "./arbeidssteder";
import { renderWithProviders } from "../../../../ducks/test-utils/renderWithProviders";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";
import { reduxForm } from "redux-form";

describe("Arbeidssteder", () => {
  const props = {
    redigerbart: true,
    visArbeidsforholdRolleEtiketter: true,
    behandlingstema: "",
  };

  const utsendtProps = {
    ...props,
    behandlingstema: MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
  };

  const reduxStore = (flereLandUkjentHvilke = false, mottatteOpplysningerType = "") => ({
    form: {
      [KV.Form.SOKNAD]: {
        registeredFields: [],
        values: {
          arbeidPaaLand: {
            erHjemmekontor: false,
            erFastArbeidssted: true,
            fysiskeArbeidssteder: [],
          },
          soknadsland: {
            landkoder: [],
            flereLandUkjentHvilke,
          },
          arbeidsstedOffshore: [],
          arbeidsstedSkip: [],
          arbeidsstedFly: [],
        },
      },
    },
    mottatteOpplysninger: {
      status: "",
      data: {
        type: mottatteOpplysningerType,
      },
    },
  });

  it("viser infomelding i stedet for arbeidssteder når flereLandUkjentHvilke er true", () => {
    renderWithProviders(<Arbeidssteder {...props} />, { preloadedState: reduxStore(true) });

    const alertstripe = screen.getByText(
      "Ikke mulig å legge til arbeidssted(er) når det ikke er oppgitt land. Du kan endre dette under sidemenypunkt “Periode og land”.",
    );
    expect(alertstripe).toBeInTheDocument();
  });

  describe("Arbeidssteder på land", () => {
    const WrappedArbeidssteder = reduxForm({ form: KV.Form.SOKNAD })(Arbeidssteder as any);

    it("rendrer arbeidsstedspørsmål ikke når behandlingstema ikke er utsendt", () => {
      // @ts-expect-error generisk beskrivelse
      renderWithProviders(<WrappedArbeidssteder {...props} />, { preloadedState: reduxStore(false) });

      const arbeidsstedPåLand = screen.getByText("Arbeidssted på land");
      expect(arbeidsstedPåLand).toBeInTheDocument();
      expect(screen.queryByText("Opplysninger om arbeidssted")).toBeNull();
      expect(screen.queryByText("Ja")).toBeNull();
      expect(screen.queryByText("Nei")).toBeNull();
    });

    it("rendrer arbeidsstedspørsmål når behandlingstema er utsendt arbeidstaker", () => {
      // @ts-expect-error generisk beskrivelse
      renderWithProviders(<WrappedArbeidssteder {...utsendtProps} />, {
        preloadedState: reduxStore(false),
      });

      const arbeidsstedPåLand = screen.getByText("Arbeidssted på land");
      expect(arbeidsstedPåLand).toBeInTheDocument();
      expect(screen.getByText("Opplysninger om arbeidssted")).toBeInTheDocument();
      expect(screen.getByText("Ja")).toBeInTheDocument();
      expect(screen.getByText("Nei")).toBeInTheDocument();
    });
  });
});
