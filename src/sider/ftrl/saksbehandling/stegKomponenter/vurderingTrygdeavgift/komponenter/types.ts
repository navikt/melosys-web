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

export interface FieldArrayProps {
  inntektskilder: Inntektskilde[];
  skatteforholdList: Skatteforhold[];
}

export type FormValuesProps = FieldValues & FieldArrayProps;
