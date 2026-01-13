import { FieldValues } from "react-hook-form";
import { Avgiftspliktigperiode } from "../../../services/modules/types/periodeTyper";

export interface Inntektskilde {
  kildetype?: string;
  arbAvgBetales?: string;
  bruttoInntekt?: number;
  fomDato?: string;
  tomDato?: string;
  erMaanedsbelop?: string;
}

export interface Skatteforhold {
  fomDato?: string;
  tomDato?: string;
  skatteplikttype?: string;
}

export interface FieldArrayProps {
  medlemskapsperioder?: Avgiftspliktigperiode[];
  inntektskilder: Inntektskilde[];
  skatteforholdsperioder: Skatteforhold[];
}

export type FormValuesProps = FieldValues & FieldArrayProps;
