import "../vurderingAarsavregningInngang.css";
import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";

interface TidligereGrunnlagProps {
  control: Control;
  redigerbart: boolean;
  erNyAarsavregning: boolean;
}

export function InnbetaltFraAvgiftssystemetInput({ control, redigerbart, erNyAarsavregning }: TidligereGrunnlagProps) {
  return (
    <Forms.Input
      label="Trygdeavgift fra Avgiftssystemet"
      description={erNyAarsavregning ? "Du skal kun endre hvis tidligere oppgitte beløp er feil" : ""}
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
