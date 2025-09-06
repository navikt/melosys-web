import "../vurderingAarsavregningInngang.less";
import { Control } from "react-hook-form";
import * as Forms from "../../../../../felleskomponenter/forms";

interface TrygdeavgiftFraAvgiftssystemetInputProps {
  control: Control;
  redigerbart: boolean;
  erNyAarsavregning: boolean;
}

export function TrygdeavgiftFraAvgiftssystemetInput({
  control,
  redigerbart,
  erNyAarsavregning,
}: TrygdeavgiftFraAvgiftssystemetInputProps) {
  return (
    <Forms.Input
      label="Trygdeavgift fra Avgiftssystemet"
      description={erNyAarsavregning ? "Du skal kun endre hvis tidligere oppgitte beløp er feil" : ""}
      name="trygdeavgiftFraAvgiftssystemet"
      control={control}
      readOnly={!redigerbart}
      className="avgift_input"
      autoComplete="off"
      type="text"
      numeric
    />
  );
}
