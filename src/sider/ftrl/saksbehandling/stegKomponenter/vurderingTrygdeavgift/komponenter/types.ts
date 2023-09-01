import { FieldValues } from "react-hook-form";

export interface Inntektskilde {
  kildetype?: string;
  arbAvgBetales?: string;
  bruttoInntekt?: number;
  fomDato?: string;
  tomDato?: string;
}

export interface FieldArrayProps {
  inntektskilder: Inntektskilde[];
}

export type FormValuesProps = FieldValues & {
  skattepliktig?: string;
} & FieldArrayProps;
