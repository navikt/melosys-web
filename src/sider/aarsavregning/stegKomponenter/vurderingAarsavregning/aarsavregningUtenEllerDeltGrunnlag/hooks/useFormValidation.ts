import { useState } from "react";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import { Skatteforhold, Inntektskilde } from "../../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import {
  finnAktivFeilmelding as finnAktivFeilmeldingOriginal,
  finnAktivFeilmeldingForMedlemskapsperioder,
} from "../valideringsfeil";
import { AarsavregningResponse } from "../../../../../../services/modules/aarsavregning/aarsavregning";

export const useFormValidation = () => {
  const [arrayValideringsfeil, setArrayValideringsfeil] = useState<string | undefined>(undefined);

  const validerForm = (
    skatteforholdsperioder: Skatteforhold[],
    inntektskilder: Inntektskilde[],
    medlemskapsperiode: { fomDato?: string; tomDato?: string } | undefined,
    medlemskapsperioder: Medlemskapsperiode[],
    medlemskapstypeErPliktig: boolean,
  ): string | undefined => {
    if (!medlemskapsperiode?.fomDato || !medlemskapsperiode?.tomDato) {
      setArrayValideringsfeil("MANGLER_GYLDIG_MEDLEMSKAPSPERIODE");
      return "MANGLER_GYLDIG_MEDLEMSKAPSPERIODE";
    }

    const aktivFeilmelding = finnAktivFeilmeldingOriginal({
      skatteforholdsperioder,
      inntektskilder,
      medlemskapsperiode: {
        fomDato: medlemskapsperiode.fomDato,
        tomDato: medlemskapsperiode.tomDato,
      },
      medlemskapsperioder,
      medlemskapstypeErPliktig,
    });

    setArrayValideringsfeil(aktivFeilmelding);
    return aktivFeilmelding;
  };

  const validerMedlemskapsperioder = (medlemskapsperioder: Medlemskapsperiode[]) => {
    const aktivFeilmelding = finnAktivFeilmeldingForMedlemskapsperioder(medlemskapsperioder);
    setArrayValideringsfeil(aktivFeilmelding);
    return aktivFeilmelding === undefined;
  };

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
