import { FieldValues } from "react-hook-form";

export interface Inntekstsrad {
  inntektskilde?: string;
  arbAvgBetales?: string;
  bruttoInntekt?: string;
}

export interface FieldArrayProps {
  inntektsrader: Inntekstsrad[];
}

export type FormValuesProps = FieldValues & {
  skattepliktig?: string;
} & FieldArrayProps;
