import { FieldValues } from "react-hook-form";

export interface Inntekstskilde {
  kildetype?: string;
  arbAvgBetales?: string;
  bruttoInntekt?: string;
}

export interface FieldArrayProps {
  inntektskilder: Inntekstskilde[];
}

export type FormValuesProps = FieldValues & {
  skattepliktig?: string;
} & FieldArrayProps;
