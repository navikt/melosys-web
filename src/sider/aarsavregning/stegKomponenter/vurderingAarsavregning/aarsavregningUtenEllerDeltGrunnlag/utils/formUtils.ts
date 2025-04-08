import { Inntektskilde, Skatteforhold } from "../../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import { Medlemskapsperiode } from "../../../../../../services/modules/medlemavfolketrygden/medlemskapsperioder";

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
  const nåværendeListeMedRelevanteFelter = medlemskapsperioderNå.map(({ fomDato, tomDato, trygdedekning }) => ({
    fomDato,
    tomDato,
    trygdedekning,
  }));

  const forrigeListeMedRelevanteFelter = medlemskapsperioderTidlgere.map(({ fomDato, tomDato, trygdedekning }) => ({
    fomDato,
    tomDato,
    trygdedekning,
  }));

  const sorterEtterFomDato = (a: any, b: any) => {
    if (!a.fomDato || !b.fomDato) return 0;
    return a.fomDato.localeCompare(b.fomDato);
  };

  return !Object.is(
    nåværendeListeMedRelevanteFelter.sort(sorterEtterFomDato),
    forrigeListeMedRelevanteFelter.sort(sorterEtterFomDato),
  );
}; 