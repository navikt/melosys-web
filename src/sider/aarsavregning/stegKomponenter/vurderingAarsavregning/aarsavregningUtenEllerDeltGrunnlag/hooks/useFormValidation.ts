import { useState, useCallback } from "react";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { Skatteforhold, Inntektskilde } from "../../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import {
  finnAktivFeilmelding as finnAktivFeilmeldingOriginal,
  finnAktivFeilmeldingForMedlemskapsperioder,
} from "../valideringsfeil";
import { AarsavregningResponse } from "../../../../../../services/modules/aarsavregning/aarsavregning";

// Define the type locally since it's not exported
interface FomTomDato {
  fomDato: string;
  tomDato: string;
}

export const useFormValidation = () => {
  const [arrayValideringsfeil, setArrayValideringsfeil] = useState<string | undefined>(undefined);

  const validerForm = useCallback(
    (
      skatteforholdsperioder: Skatteforhold[],
      inntektskilder: Inntektskilde[],
      medlemskapsperiode: { fomDato?: string; tomDato?: string }, // Allow undefined here
      medlemskapsperioder: Medlemskapsperiode[],
      medlemskapstypeErPliktig: boolean,
    ) => {
      // Cast to the expected type for the validation function, ensuring non-undefined dates
      const validMedlemskapsperiode: FomTomDato = {
        fomDato: medlemskapsperiode.fomDato || "", // Default to empty string if undefined
        tomDato: medlemskapsperiode.tomDato || "", // Default to empty string if undefined
      };

      const aktivFeilmelding = finnAktivFeilmeldingOriginal({
        skatteforholdsperioder,
        inntektskilder,
        medlemskapsperiode: validMedlemskapsperiode, // Use the validated object
        medlemskapsperioder,
        medlemskapstypeErPliktig,
      });

      setArrayValideringsfeil(aktivFeilmelding);
      return aktivFeilmelding === undefined;
    },
    [],
  );

  const validerMedlemskapsperioder = useCallback((medlemskapsperioder: Medlemskapsperiode[]) => {
    const aktivFeilmelding = finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder);
    setArrayValideringsfeil(aktivFeilmelding);
    return aktivFeilmelding === undefined;
  }, []);

  const stegErGyldig = (formIsValid: boolean, aarsavregningResponse?: AarsavregningResponse, feilmelding?: string) => {
    return Boolean(formIsValid && aarsavregningResponse?.nyttGrunnlag && feilmelding === undefined);
  };

  return {
    arrayValideringsfeil,
    setArrayValideringsfeil,
    validerForm,
    validerMedlemskapsperioder,
    stegErGyldig,
  };
};
