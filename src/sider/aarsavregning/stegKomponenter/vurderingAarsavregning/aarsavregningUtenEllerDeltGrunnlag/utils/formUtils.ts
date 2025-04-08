import { Inntektskilde, Skatteforhold } from "../../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import * as Utils from "../../../../../../utils";

export const mapFormState = (
  skatteforholdsperioderFormState: Skatteforhold[],
  inntektskilderFormState: Inntektskilde[],
  medlemskapsperioderFormState: Medlemskapsperiode[],
  totaltForskuddsvisFakturertParam: number | undefined,
) => ({
  skatteforholdsperioder: skatteforholdsperioderFormState.map((skatteforhold: Skatteforhold) => ({
    fomDato: skatteforhold.fomDato,
    tomDato: skatteforhold.tomDato,
    skatteplikttype: skatteforhold.skatteplikttype,
  })),
  inntektskilder: inntektskilderFormState.map((inntektskilde: Inntektskilde) => ({
    fomDato: inntektskilde.fomDato,
    tomDato: inntektskilde.tomDato,
    kildetype: inntektskilde.kildetype,
    bruttoInntekt: inntektskilde.bruttoInntekt,
    arbAvgBetales: inntektskilde.arbAvgBetales,
    erMaanedsbelop: inntektskilde.erMaanedsbelop,
  })),
  medlemskapsperioder: medlemskapsperioderFormState.map((periode: Medlemskapsperiode) => ({
    fomDato: periode.fomDato,
    tomDato: periode.tomDato,
    trygdedekning: periode.trygdedekning,
    medlemskapstype: periode.medlemskapstype,
  })),
  totaltForskuddsvisFakturert: totaltForskuddsvisFakturertParam,
});

export const medlemskapsperioderHarBrukerendringer = (
  medlemskapsperioderNå: Medlemskapsperiode[],
  medlemskapsperioderTidlgere: Medlemskapsperiode[],
) => {
  // Ensure we have arrays to compare
  if (!medlemskapsperioderNå || !medlemskapsperioderTidlgere) {
    console.warn("Comparing undefined medlemskapsperioder arrays?");
    return medlemskapsperioderNå !== medlemskapsperioderTidlgere; // Basic check if one is missing
  }

  // If lengths differ, they have changed
  if (medlemskapsperioderNå.length !== medlemskapsperioderTidlgere.length) {
    console.log("*** Comparing medlemskapsperioder: Lengths differ ***");
    return true;
  }

  // Prepare for deep comparison - create copies without the 'id' field
  const mapForComparison = (p: Medlemskapsperiode) => {
    const { id, ...rest } = p; // Destructure to omit 'id'
    return rest;
  };
  const nåUtenId = medlemskapsperioderNå.map(mapForComparison);
  const tidligereUtenId = medlemskapsperioderTidlgere.map(mapForComparison);

  // Perform deep comparison on the arrays of objects (without id)
  // Utils._isEqual should handle order differences implicitly
  console.log("*** Comparing medlemskapsperioder (deep, no id) ***", { nå: nåUtenId, tidligere: tidligereUtenId });
  const isEqual = Utils._isEqual(nåUtenId, tidligereUtenId);
  console.log("*** Comparison result (isEqual):", isEqual, " -> Har brukerendringer:", !isEqual);

  // Return true if they are NOT equal
  return !isEqual;
};
