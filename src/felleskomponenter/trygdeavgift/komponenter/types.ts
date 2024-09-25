import { FieldValues } from "react-hook-form";

export interface Inntektskilde {
  kildetype?: string;
  arbAvgBetales?: string;
  bruttoInntekt?: number;
  fomDato?: string;
  tomDato?: string;
}

export interface Skatteforhold {
  fomDato?: string;
  tomDato?: string;
  skatteplikttype?: string;
}

export interface Medlemskapsperiode {
  fomDato?: string;
  tomDato?: string;
  bestemmelse?: string;
  dekning?: string;
}

export interface FieldArrayProps {
  inntektskilder: Inntektskilde[];
  skatteforholdsperioder: Skatteforhold[];
  medlemskapsperioder: Medlemskapsperiode[];
}

export type FormValuesProps = FieldValues & FieldArrayProps;
