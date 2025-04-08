import { Inntektskilde, Skatteforhold } from "../../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";
import * as Utils from "../../../../../../utils";

/**
 * Mapper skjemadata til et enklere format for sammenligning og potensielt API-kall.
 * Fjerner unødvendige felter som React Hook Form's `id`.
 */
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

/**
 * Sjekker om det er reelle brukerendringer i medlemskapsperiodene.
 * Sammenligner listene dypt, men ignorerer `id`-feltet som kun er for React keys.
 */
export const medlemskapsperioderHarBrukerendringer = (
  medlemskapsperioderNå: Medlemskapsperiode[],
  medlemskapsperioderTidlgere: Medlemskapsperiode[],
) => {
  // Sikrer at vi har arrays å sammenligne
  if (!medlemskapsperioderNå || !medlemskapsperioderTidlgere) {
    console.warn("Sammenligner udefinerte medlemskapsperioder arrays?");
    // Enkel sjekk hvis en mangler
    return medlemskapsperioderNå !== medlemskapsperioderTidlgere;
  }

  // Hvis lengden er ulik, har de endret seg
  if (medlemskapsperioderNå.length !== medlemskapsperioderTidlgere.length) {
    console.log("*** Sammenligner medlemskapsperioder: Lengde ulik ***");
    return true;
  }

  // Forbered for dyp sammenligning - lag kopier uten 'id'-feltet
  const mapForComparison = (p: Medlemskapsperiode) => {
    const { id, ...rest } = p; // Destrukturering for å utelate 'id'
    return rest;
  };
  const nåUtenId = medlemskapsperioderNå.map(mapForComparison);
  const tidligereUtenId = medlemskapsperioderTidlgere.map(mapForComparison);

  // Utfør dyp sammenligning på arrayene av objekter (uten id)
  // Utils._isEqual bør håndtere rekkefølge implisitt hvis den gjør en dyp set-lignende sjekk
  // Hvis den er rekkefølge-sensitiv, må vi sortere begge arrayene først.
  console.log("*** Sammenligner medlemskapsperioder (dyp, uten id) ***", { nå: nåUtenId, tidligere: tidligereUtenId });
  const isEqual = Utils._isEqual(nåUtenId, tidligereUtenId);
  console.log("*** Sammenligningsresultat (isEqual):", isEqual, " -> Har brukerendringer:", !isEqual);

  // Returnerer true hvis de IKKE er like
  return !isEqual;
};
