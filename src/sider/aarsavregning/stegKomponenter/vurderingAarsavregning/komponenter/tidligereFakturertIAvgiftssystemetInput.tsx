import "../vurderingAarsavregningInngang.css";
import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";

interface TidligereGrunnlagProps {
  control: Control;
  redigerbart: boolean;
}

export function TidligereFakturertIAvgiftssystemetInput({ control, redigerbart }: TidligereGrunnlagProps) {
  return (
    <Forms.Input
      label="Totalt tidligere fakturert trygdeavgift fra Avgiftssystemet:"
      name="totaltForskuddsvisFakturert"
      control={control}
      readOnly={!redigerbart}
      className="avgift_input"
      autoComplete="off"
      type="text"
      numeric
      tillattNegativeTall
    />
  );
}
